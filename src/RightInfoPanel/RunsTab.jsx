import { Fragment, useMemo, useState } from "react";
import { clearRuns, toggleRun } from "@slices/prioritizrSlice";
import {
  useDeletePrioritizrRunMutation,
  useListPrioritizrRunsQuery,
} from "@slices/prioritizrApiSlice";
import { useDispatch, useSelector } from "react-redux";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { selectCurrentUserId } from "@slices/authSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";

const fmtDate = (iso) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));

const fmtTime = (iso) =>
  new Intl.DateTimeFormat("en-GB", {
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));

// YlGn colormap stops matching the map layer
const YLGN_STOPS = ["#ffffe5", "#d9f0a3", "#78c679", "#238443", "#004529"];

const FrequencyLegend = ({ runCount }) => (
  <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "brand.border" }}>
    <Typography
      variant="caption"
      fontWeight={700}
      sx={{ mb: 0.5, display: "block", letterSpacing: "0.06em" }}
    >
      SELECTION FREQUENCY
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {runCount < 2 ? "0 runs" : "1 run"}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 14,
          borderRadius: 1,
          border: "1px solid #ccd6db",
          background: `linear-gradient(to right, ${YLGN_STOPS.join(", ")})`,
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {runCount} runs
      </Typography>
    </Box>
  </Box>
);

const runName = (run) => run.label?.trim() || `Run ${run.id}`;
const boundaryPenalty = (run) => Number(run.params?.penalties?.boundary ?? 0);

const statusColour = (theme, status) =>
  ({
    completed: theme.palette.brand.green,
    running: theme.palette.brand.mid,
    failed: theme.palette.error.main,
  })[status] ?? theme.palette.brand.muted;

// Boundary penalty as a 4-segment meter + value. Buckets are coarse on
// purpose — the number is there for anyone who needs the exact value.
const bpLevel = (v) =>
  v === 0 ? 0 : v < 0.001 ? 0 : v < 0.002 ? 1 : v < 0.005 ? 2 : 4;

const PenaltyChip = ({ value }) => {
  const filled = bpLevel(value);
  return (
    <Tooltip title={`Boundary penalty ${value}`}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: "brand.tealDark",
          fontSize: "0.65rem",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
        }}
      >
        <Box sx={{ display: "inline-flex", gap: "2px" }}>
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: 11,
                borderRadius: "1px",
                backgroundColor: i < filled ? "brand.teal" : "#e3eaee",
              }}
            />
          ))}
        </Box>
        BP&nbsp;{value.toFixed(1)}
      </Box>
    </Tooltip>
  );
};

const OwnerAvatar = ({ name, isMe }) => (
  <Tooltip title={name ? `${name}${isMe ? " (you)" : ""}` : "Unknown owner"}>
    <Box
      sx={{
        width: 20,
        height: 20,
        flex: "none",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: "0.55rem",
        fontWeight: 700,
        color: "#fff",
        backgroundColor: isMe ? "primary.main" : "brand.muted",
      }}
    >
      {name ? name.slice(0, 2).toUpperCase() : "–"}
    </Box>
  </Tooltip>
);

const RunsTab = () => {
  const dispatch = useDispatch();
  const { showMessage } = useAppSnackbar();

  const projectId = useSelector((s) => s.project.activeProjectId);
  const selectedRunIds = useSelector((s) => s.prioritizr.selectedRunIds);
  const userId = useSelector(selectCurrentUserId);

  const { data: runsResp } = useListPrioritizrRunsQuery(projectId, {
    skip: !projectId,
  });
  const runs = useMemo(() => runsResp?.data ?? [], [runsResp]);

  const [deleteRun] = useDeletePrioritizrRunMutation();

  const [query, setQuery] = useState("");
  const [expandedRunIds, setExpandedRunIds] = useState(() => new Set());
  const [expandedDates, setExpandedDates] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return runs;
    return runs.filter((r) =>
      `${runName(r)} ${r.description ?? ""}`.toLowerCase().includes(q),
    );
  }, [runs, query]);

  // Grouped by date, most recent first. While searching we show a flat list
  // instead — otherwise matches hide inside collapsed date sections.
  const groupedRuns = useMemo(() => {
    const groups = new Map();
    for (const run of filtered) {
      const key = fmtDate(run.created_at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(run);
    }
    return [...groups.entries()].map(([date, dateRuns]) => ({
      date,
      runs: dateRuns,
    }));
  }, [filtered]);

  // Default: only the most recent date is open.
  const openDates =
    expandedDates ?? new Set(groupedRuns.length ? [groupedRuns[0].date] : []);

  const toggleDate = (date) => {
    const next = new Set(openDates);
    next.has(date) ? next.delete(date) : next.add(date);
    setExpandedDates(next);
  };

  const toggleDescription = (runId) =>
    setExpandedRunIds((prev) => {
      const next = new Set(prev);
      next.has(runId) ? next.delete(runId) : next.add(runId);
      return next;
    });

  const handleDelete = async (run) => {
    setConfirmId(null);
    try {
      await deleteRun(run.id).unwrap();
      if (selectedRunIds.includes(run.id)) dispatch(toggleRun(run.id));
      showMessage(`Deleted ${runName(run)}`, "success");
    } catch (err) {
      showMessage(err?.data?.error || "Could not delete this run", "error");
    }
  };

  const renderRun = (run, { showDate = false } = {}) => {
    if (confirmId === run.id) {
      return (
        <Box
          key={run.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            borderLeft: 3,
            borderColor: "error.main",
            backgroundColor: "rgba(211,47,47,0.06)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ flex: 1, color: "error.main", minWidth: 0 }}
          >
            Delete “{runName(run)}” and its results?
          </Typography>
          <Button size="small" onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleDelete(run)}
          >
            Delete
          </Button>
        </Box>
      );
    }

    const isActive = selectedRunIds.includes(run.id);
    const isExpanded = expandedRunIds.has(run.id);
    const hasDescription = !!run.description?.trim();
    // can_delete is computed by the server from the same rule the delete
    // endpoint enforces — creator, project owner, or admin.
    const canDelete = !!run.can_delete;
    const isMine =
      run.created_by != null && Number(run.created_by) === Number(userId);

    return (
      <Fragment key={run.id}>
        <Box
          onClick={() => dispatch(toggleRun(run.id))}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            cursor: "pointer",
            borderBottom: "1px solid #edf1f4",
            backgroundColor: isActive ? "rgba(68,129,136,0.11)" : "inherit",
            boxShadow: isActive
              ? (theme) => `inset 3px 0 0 ${theme.palette.brand.teal}`
              : "none",
            "&:hover": {
              backgroundColor: isActive
                ? "rgba(68,129,136,0.17)"
                : "rgba(45,63,74,0.035)",
            },
            "& .runDelete": { opacity: 0 },
            "&:hover .runDelete": { opacity: 1 },
          }}
        >
          <Box sx={{ width: 20, flex: "none" }}>
            {hasDescription && (
              <IconButton
                size="small"
                sx={{ p: 0.25 }}
                aria-label="Toggle description"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDescription(run.id);
                }}
              >
                {isExpanded ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ChevronRightIcon fontSize="small" />
                )}
              </IconButton>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              title={runName(run)}
              sx={{ fontSize: "0.78rem", fontWeight: isActive ? 700 : 500 }}
            >
              {runName(run)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 0.25,
              }}
            >
              <Tooltip title={run.status}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    flex: "none",
                    borderRadius: "50%",
                    backgroundColor: (theme) => statusColour(theme, run.status),
                  }}
                />
              </Tooltip>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontFamily: "monospace" }}
              >
                {showDate
                  ? `${fmtDate(run.created_at)} · ${fmtTime(run.created_at)}`
                  : fmtTime(run.created_at)}
              </Typography>
              <PenaltyChip value={boundaryPenalty(run)} />
              {run.status !== "completed" && (
                <Typography
                  variant="caption"
                  sx={{ color: (theme) => statusColour(theme, run.status) }}
                >
                  {run.status}
                </Typography>
              )}
            </Box>
          </Box>

          <OwnerAvatar name={run.created_by_name} isMe={isMine} />

          <Box sx={{ width: 26, flex: "none" }}>
            {canDelete && (
              <Tooltip title="Delete this run">
                <IconButton
                  size="small"
                  className="runDelete"
                  sx={{ p: 0.25 }}
                  aria-label={`Delete run ${run.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmId(run.id);
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {hasDescription && isExpanded && (
          <Typography
            variant="caption"
            component="div"
            sx={{
              px: 1.5,
              pb: 1.25,
              pl: 4.5,
              borderBottom: "1px solid #edf1f4",
              whiteSpace: "pre-wrap",
              color: "text.secondary",
            }}
          >
            {run.description}
          </Typography>
        )}
      </Fragment>
    );
  };

  return (
    <Box>
      <FrequencyLegend runCount={selectedRunIds.length} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 1,
          borderBottom: 1,
          borderColor: "brand.border",
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search runs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputProps={{ "aria-label": "Search runs" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "brand.muted" }} />
              </InputAdornment>
            ),
            sx: { fontSize: "0.78rem" },
          }}
        />
        <Tooltip title="Remove every run from the map">
          <span>
            <Button
              size="small"
              disabled={selectedRunIds.length === 0}
              onClick={() => dispatch(clearRuns())}
              sx={{ whiteSpace: "nowrap", fontSize: "0.7rem" }}
            >
              Clear all
            </Button>
          </span>
        </Tooltip>
      </Box>

      {query.trim()
        ? filtered.map((run) => renderRun(run, { showDate: true }))
        : groupedRuns.map(({ date, runs: dateRuns }) => (
            <Accordion
              key={date}
              disableGutters
              expanded={openDates.has(date)}
              onChange={() => toggleDate(date)}
              sx={{ "&:before": { display: "none" }, boxShadow: "none" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: "brand.surfaceTint",
                  borderTop: 1,
                  borderBottom: 1,
                  borderColor: "brand.border",
                  minHeight: 36,
                  "& .MuiAccordionSummary-content": {
                    margin: "4px 0",
                    alignItems: "baseline",
                    gap: 1,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {date}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontFamily: "monospace" }}
                >
                  {dateRuns.length} run{dateRuns.length === 1 ? "" : "s"}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {dateRuns.map((run) => renderRun(run))}
              </AccordionDetails>
            </Accordion>
          ))}

      {filtered.length === 0 && (
        <Typography
          sx={{
            p: 2.5,
            textAlign: "center",
            color: "text.secondary",
            fontSize: "0.8rem",
          }}
        >
          {query.trim() ? "No runs match your search" : "No runs yet"}
        </Typography>
      )}
    </Box>
  );
};

export default RunsTab;

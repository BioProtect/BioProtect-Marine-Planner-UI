import { useDispatch, useSelector } from "react-redux";
import { Fragment, useMemo, useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import Log from "./Log";
import MapLegend from "./MapLegend";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { setActiveResultsTab } from "@slices/uiSlice";
import { toggleRun } from "@slices/prioritizrSlice";
import { useListPrioritizrRunsQuery } from "@slices/prioritizrApiSlice";

// YlGn colormap stops matching the map layer
const YLGN_STOPS = [
  { color: "#ffffe5", label: "1 run" },
  { color: "#d9f0a3", label: "" },
  { color: "#78c679", label: "" },
  { color: "#238443", label: "" },
  { color: "#004529", label: "All runs" },
];

const FrequencyLegend = ({ runCount }) => {
  return (
    <Box sx={{ px: 1.5, py: 1, borderTop: "1px solid #eee" }}>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ mb: 0.5, display: "block" }}
      >
        Selection frequency
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mr: 0.5, whiteSpace: "nowrap" }}
        >
          {runCount < 2 ? "0 runs" : "1 run"}
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: 14,
            borderRadius: 1,
            background: `linear-gradient(to right, ${YLGN_STOPS.map((s) => s.color).join(", ")})`,
            border: "1px solid #ccc",
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ml: 0.5, whiteSpace: "nowrap" }}
        >
          {runCount} runs
        </Typography>
      </Box>
    </Box>
  );
};

const TAB_VALUES = ["legend", "runs", "log"];

const ResultsPanel = (props) => {
  const dispatch = useDispatch();
  const { dialogStates, importLog, activeResultsTab } = useSelector(
    (state) => state.ui,
  );
  const projectId = useSelector((s) => s.project.activeProjectId);
  const selectedRunIds = useSelector((s) => s.prioritizr.selectedRunIds);

  const { data: runsResp } = useListPrioritizrRunsQuery(projectId, {
    skip: !projectId,
  });
  const runs = runsResp?.data ?? [];

  const currentTabIndex = Math.max(0, TAB_VALUES.indexOf(activeResultsTab));
  const handleTabChange = (_e, idx) =>
    dispatch(setActiveResultsTab(TAB_VALUES[idx] ?? "legend"));

  const formatDate = (created_at) => {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(new Date(created_at));
  };

  const formatTime = (created_at) => {
    return new Intl.DateTimeFormat("en-GB", {
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(created_at));
  };

  // Group runs by date, sorted most recent first
  const groupedRuns = useMemo(() => {
    const groups = {};
    for (const run of runs) {
      const dateKey = formatDate(run.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(run);
    }
    // Sort dates descending
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      return (
        new Date(groups[b][0].created_at) - new Date(groups[a][0].created_at)
      );
    });
    return sortedKeys.map((date) => ({ date, runs: groups[date] }));
  }, [runs]);

  // Most recent date starts expanded
  const [expandedDates, setExpandedDates] = useState(null);
  const getExpandedDates = () => {
    if (expandedDates !== null) return expandedDates;
    // Default: only the most recent date is open
    if (groupedRuns.length > 0) return new Set([groupedRuns[0].date]);
    return new Set();
  };

  const handleAccordionToggle = (date) => {
    const current = getExpandedDates();
    const next = new Set(current);
    if (next.has(date)) {
      next.delete(date);
    } else {
      next.add(date);
    }
    setExpandedDates(next);
  };

  const handleRowClick = (runId) => {
    dispatch(toggleRun(runId));
  };

  // Tracks which rows have their description expanded. Independent from the
  // selectedRunIds set used for map rendering.
  const [expandedRunIds, setExpandedRunIds] = useState(() => new Set());
  const toggleExpanded = (runId) => {
    setExpandedRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) next.delete(runId);
      else next.add(runId);
      return next;
    });
  };

  if (!dialogStates.resultsPanelOpen) return null;

  return (
    <div
      className="resultsPanel"
      style={{
        position: "absolute",
        right: "60px",
        top: "80px",
        width: "400px",
        maxHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "100%",
          overflow: "hidden",
        }}
      >
        <div className="resultsTitle">Results</div>

        <Tabs value={currentTabIndex} onChange={handleTabChange} centered>
          <Tab label="Legend" />
          <Tab label="Runs" />
          <Tab label="Log" />
        </Tabs>

        <div style={{ overflow: "auto", flex: 1 }}>
          {currentTabIndex === 0 && (
            <MapLegend
              changeOpacity={props.changeOpacity}
              visibleLayers={props.visibleLayers}
              costsLoading={props.costsLoading}
              brew={props.brew}
            />
          )}

          {currentTabIndex === 1 && (
            <div style={{ padding: "8px" }}>
              <FrequencyLegend runCount={selectedRunIds.length} />
              {groupedRuns.map(({ date, runs: dateRuns }) => (
                <Accordion
                  key={date}
                  expanded={getExpandedDates().has(date)}
                  onChange={() => handleAccordionToggle(date)}
                  disableGutters
                  sx={{
                    "&:before": { display: "none" },
                    boxShadow: "none",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: "rgba(0,0,0,0.03)",
                      minHeight: 36,
                      "& .MuiAccordionSummary-content": { margin: "4px 0" },
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    {date} ({dateRuns.length} run
                    {dateRuns.length !== 1 ? "s" : ""})
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: 0 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 28, p: 0 }} />
                          <TableCell
                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            Name
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            Status
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            Started
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dateRuns.map((row) => {
                          const isActive = selectedRunIds.includes(row.id);
                          const isExpanded = expandedRunIds.has(row.id);
                          const displayName =
                            row.label?.trim() || `Run ${row.id}`;
                          const hasDescription = !!row.description?.trim();
                          return (
                            <Fragment key={row.id}>
                              <TableRow
                                onClick={() => handleRowClick(row.id)}
                                sx={{
                                  cursor: "pointer",
                                  backgroundColor: isActive
                                    ? "rgba(0, 188, 212, 0.15)"
                                    : "inherit",
                                  "&:hover": {
                                    backgroundColor: isActive
                                      ? "rgba(0, 188, 212, 0.25)"
                                      : "rgba(0, 0, 0, 0.04)",
                                  },
                                  "& > td": { borderBottom: hasDescription && isExpanded ? "none" : undefined },
                                }}
                              >
                                <TableCell sx={{ width: 28, p: 0 }}>
                                  {hasDescription ? (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpanded(row.id);
                                      }}
                                      sx={{ p: 0.25 }}
                                    >
                                      {isExpanded ? (
                                        <ExpandMoreIcon fontSize="small" />
                                      ) : (
                                        <ChevronRightIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  ) : null}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: "0.78rem",
                                    maxWidth: 160,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={displayName}
                                >
                                  {displayName}
                                </TableCell>
                                <TableCell sx={{ fontSize: "0.75rem" }}>
                                  {row.status}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontSize: "0.75rem" }}
                                >
                                  {formatTime(row.created_at)}
                                </TableCell>
                              </TableRow>
                              {hasDescription && isExpanded && (
                                <TableRow>
                                  <TableCell />
                                  <TableCell colSpan={3} sx={{ py: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        whiteSpace: "pre-wrap",
                                        color: "text.secondary",
                                      }}
                                    >
                                      {row.description}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))}
              {groupedRuns.length === 0 && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#888",
                    fontSize: "0.85rem",
                  }}
                >
                  No runs yet
                </div>
              )}
            </div>
          )}

          {currentTabIndex === 2 && <Log messages={importLog} />}
        </div>
      </Paper>
    </div>
  );
};

export default ResultsPanel;

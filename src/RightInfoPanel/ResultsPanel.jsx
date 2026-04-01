import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Log from "../Log";
import MapLegend from "./MapLegend";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import { toggleRun } from "@slices/prioritizrSlice";
import { useListPrioritizrRunsQuery } from "@slices/prioritizrApiSlice";

const ResultsPanel = (props) => {
  const dispatch = useDispatch();
  const { dialogStates, importLog } = useSelector((state) => state.ui);
  const projectId = useSelector((s) => s.project.activeProjectId);
  const selectedRunIds = useSelector((s) => s.prioritizr.selectedRunIds);

  const { data: runsResp } = useListPrioritizrRunsQuery(projectId, {
    skip: !projectId,
  });
  const runs = runsResp?.data ?? [];

  const [currentTabIndex, setCurrentTabIndex] = useState(0);

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
      return new Date(groups[b][0].created_at) - new Date(groups[a][0].created_at);
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

        <Tabs
          value={currentTabIndex}
          onChange={(e, idx) => setCurrentTabIndex(idx)}
          centered
        >
          <Tab label="Legend" />
          <Tab label="Runs" />
          <Tab label="Log" />
        </Tabs>

        <div style={{ overflow: "auto", flex: 1 }}>
          {currentTabIndex === 0 && <MapLegend {...props} brew={props.brew} />}

          {currentTabIndex === 1 && (
            <div style={{ padding: "8px" }}>
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
                    {date} ({dateRuns.length} run{dateRuns.length !== 1 ? "s" : ""})
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: 0 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                            Run ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                            Status
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            Time
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dateRuns.map((row) => {
                          const isActive = selectedRunIds.includes(row.id);
                          return (
                            <TableRow
                              key={row.id}
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
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: isActive ? 600 : 400,
                                  fontSize: "0.8rem",
                                }}
                              >
                                {row.id}
                              </TableCell>
                              <TableCell sx={{ fontSize: "0.8rem" }}>
                                {row.status}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: "0.8rem" }}>
                                {formatTime(row.created_at)}
                              </TableCell>
                            </TableRow>
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

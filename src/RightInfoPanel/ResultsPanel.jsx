import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";

import Log from "../Log";
import MapLegend from "./MapLegend";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import { selectRun } from "@slices/prioritizrSlice";
import { useListPrioritizrRunsQuery } from "@slices/prioritizrApiSlice";

const activeTabArr = ["legend", "runs", "log"];

const ResultsPanel = (props) => {
  const dispatch = useDispatch();
  const { dialogStates, importLog } = useSelector((state) => state.ui);
  const projectId = useSelector((s) => s.project.activeProjectId);
  const selectedRunId = useSelector((s) => s.prioritizr.selectedRunId);
  const [selected, setSelected] = useState(null);

  const { data: runsResp } = useListPrioritizrRunsQuery(projectId, {
    skip: !projectId,
  });
  const runs = runsResp?.data ?? [];

  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const prevProps = useRef();
  useEffect(() => {
    prevProps.current = props;
  });

  const panelStyle = useMemo(
    () => ({
      top: "80px",
      width: "400px",
      height: "600px",
      position: "absolute",
      right: "60px",
    }),
    [],
  );

  const handleTabChange = (evt, currentTabIndex) => {
    setCurrentTabIndex(currentTabIndex);
  };

  const handleTableClick = (evt, row) => {
    setSelected(row.id);
    dispatch(selectRun(row.id));
  };

  const formatted = (created_at) => {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(new Date(created_at));
  };

  if (!dialogStates.resultsPanelOpen) return null;

  const displayStyle = {
    display: dialogStates.resultsPanelOpen ? "block" : "none",
  };

  const combinedDisplayStyles = { ...panelStyle, ...displayStyle };

  return (
    <div className="resultsPanel" style={combinedDisplayStyles}>
      <Paper elevation={2}>
        <div className="resultsTitle">Results</div>

        <Tabs value={currentTabIndex} onChange={handleTabChange} centered>
          <Tab label="Legend" />
          <Tab label="Runs" />
          <Tab label="Log" />
        </Tabs>

        {currentTabIndex === 0 && <MapLegend {...props} brew={props.brew} />}

        {currentTabIndex === 1 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Run ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.map((row) => (
                  <TableRow
                    key={`${row.date}${row.id}`}
                    onClick={(e) => handleTableClick(e, row)}
                    selected={row.id === selected}
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell align="right">
                      {formatted(row.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {currentTabIndex === 2 && <Log messages={importLog} />}
      </Paper>
    </div>
  );
};

export default ResultsPanel;

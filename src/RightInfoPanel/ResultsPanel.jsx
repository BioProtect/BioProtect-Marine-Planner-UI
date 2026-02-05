import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import Clipboard from "@mui/icons-material/Assignment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Log from "../Log";
import MapLegend from "./MapLegend";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Sync from "@mui/icons-material/Sync";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import Tabs from "@mui/material/Tabs";
import { faEraser } from "@fortawesome/free-solid-svg-icons";
import { selectRun } from "@slices/prioritizrSlice";
import { useListPrioritizrRunsQuery } from "@slices/prioritizrApiSlice";

const activeTabArr = ["legend", "runs", "log"];

const ResultsPanel = (props) => {
  const dispatch = useDispatch();
  const { dialogStates, importLog } = useSelector((state) => state.ui);
  const projectId = useSelector((s) => s.project.activeProjectId);
  const selectedRunId = useSelector((s) => s.prioritizr.selectedRunId);

  const { data: runs = [] } = useListPrioritizrRunsQuery(projectId, {
    skip: !projectId,
  });

  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const prevProps = useRef();
  useEffect(() => {
    prevProps.current = props;
  });

  const handleTabChange = (evt, currentTabIndex) => {
    setCurrentTabIndex(currentTabIndex);
  };

  if (!dialogStates.resultsPanelOpen) return null;

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
          <Table
            data={runs}
            columns={[
              { Header: "Run ID", accessor: "id", width: 60 },
              { Header: "Status", accessor: "status", width: 100 },
              { Header: "Created", accessor: "created_at", width: 160 },
              { Header: "User", accessor: "created_by", width: 80 },
            ]}
            getTrProps={(_, row) => ({
              onClick: () => dispatch(selectRun(row.original.id)),
              style: {
                background:
                  row.original.id === selectedRunId ? "aliceblue" : "",
              },
              title: "Click to show results on map",
            })}
            showPagination={false}
            pageSize={runs.length}
            noDataText="No runs yet"
          />
        )}

        {currentTabIndex === 2 && <Log messages={importLog} />}
      </Paper>
    </div>
  );
};

export default ResultsPanel;

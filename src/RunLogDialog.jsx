import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  faCheckCircle,
  faEraser,
  faExclamationTriangle,
  faRedoAlt,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "./MarxanDialog";
import Sync from "@mui/icons-material/Sync";
import ToolbarButton from "./ToolbarButton";
import { toggleDialog } from "./slices/uiSlice";

const RunLogDialog = ({
  loading,
  preprocessing,
  unauthorisedMethods,
  runLogs,
  getRunLogs,
  clearRunLogs,
  stopMarxan,
  userRole,
  runlogTimer,
}) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [searchText, setSearchText] = useState("");
  const [selectedRun, setSelectedRun] = useState(undefined);
  const [runningJobs, setRunningJobs] = useState(false);

  useEffect(() => {
    const runningLogs = runLogs.filter((item) => item.status === "Running");
    setRunningJobs(runningLogs.length > 0);
  }, [runLogs]);

  const closeDialog = () => {
    setSelectedRun(undefined);
    clearInterval(runlogTimer);
    dispatch(toggleDialog({ dialogName: "runLogDialogOpen", isOpen: false }));
    onOk();
  };

  const stopRun = () => {
    if (selectedRun) {
      stopMarxan("m" + selectedRun.pid);
      refreshRunLogs();
    }
  };

  const refreshRunLogs = () => {
    getRunLogs();
    setSelectedRun(undefined);
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return (
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{ color: "green" }}
            title={"Run completed"}
          />
        );
      case "Stopped":
        return (
          <FontAwesomeIcon
            icon={faTimesCircle}
            style={{ color: "darkgray" }}
            title={"Run stopped by the user"}
          />
        );
      case "Killed":
        return (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ color: "red" }}
            title={"Run stopped by the operating system"}
          />
        );
      case "Running":
        return (
          <Sync
            className="spin"
            style={{
              height: "16px",
              width: "16px",
              verticalAlign: "sub",
              color: "rgb(255, 64, 129)",
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderRuntime = (runtime) => {
    if (runtime) {
      const seconds = parseInt(runtime.slice(0, -1), 10);
      const mins = Math.floor(seconds / 60);
      const secs = (seconds % 60) + "s";
      return mins > 0 ? `${mins}m ${secs}` : secs;
    }
    return "";
  };

  return (
    <MarxanDialog
      loading={loading}
      open={dialogStates.runLogDialogOpen}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      showCancelButton={false}
      helpLink={"user.html#the-run-log"}
      autoDetectWindowHeight={false}
      title="Runs"
      showSearchBox={true}
      searchTextChanged={setSearchText}
    >
      <React.Fragment key="k2">
        <div id="projectsTable">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Ended</TableCell>
                  <TableCell>Runtime</TableCell>
                  <TableCell>Runs</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runLogs
                  .filter(
                    (row) =>
                      row.user.includes(searchText) ||
                      row.project.includes(searchText) ||
                      row.status.includes(searchText)
                  )
                  .map((row) => (
                    <TableRow
                      key={row.pid}
                      onClick={() => setSelectedRun(row)}
                      style={{
                        background:
                          selectedRun?.pid === row.pid ? "aliceblue" : "",
                        cursor: "pointer",
                      }}
                    >
                      <TableCell>{row.pid}</TableCell>
                      <TableCell>{row.user}</TableCell>
                      <TableCell>{row.project}</TableCell>
                      <TableCell>{row.starttime}</TableCell>
                      <TableCell>{row.endtime || ""}</TableCell>
                      <TableCell>{renderRuntime(row.runtime)}</TableCell>
                      <TableCell>{row.runs}</TableCell>
                      <TableCell>
                        {renderStatusIcon(row.status)} {row.status}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {userRole === "Admin" && (
          <div id="projectsToolbar" style={{ marginTop: "10px" }}>
            <ToolbarButton
              show={!unauthorisedMethods.includes("stopMarxan")}
              title="Stop run"
              disabled={
                !selectedRun ||
                (!preprocessing && !runningJobs) ||
                selectedRun.status !== "Running"
              }
              onClick={stopRun}
              label={"Stop"}
              secondary={true}
            />
            <ToolbarButton
              show={!unauthorisedMethods.includes("getRunLogs")}
              title="Refresh run logs"
              icon={<FontAwesomeIcon icon={faRedoAlt} />}
              onClick={refreshRunLogs}
            />
            <ToolbarButton
              show={!unauthorisedMethods.includes("clearRunLogs")}
              title="Clear run logs"
              icon={<FontAwesomeIcon icon={faEraser} />}
              onClick={clearRunLogs}
            />
          </div>
        )}
      </React.Fragment>
    </MarxanDialog>
  );
};

export default RunLogDialog;

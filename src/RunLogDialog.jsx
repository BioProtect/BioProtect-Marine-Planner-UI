import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import MarxanDialog from "./MarxanDialog";
import Paper from "@mui/material/Paper";
import RedoIcon from "@mui/icons-material/Redo";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import Sync from "@mui/icons-material/Sync";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ToolbarButton from "./ToolbarButton";
import Typography from "@mui/material/Typography";
import WarningIcon from "@mui/icons-material/Warning";
import { toggleDialog } from "@slices/uiSlice";

const RunLogDialog = ({
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
  const uiState = useSelector((state) => state.ui);
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
          <CheckCircleIcon style={{ color: "green" }} title={"Run completed"} />
        );
      case "Stopped":
        return (
          <StopCircleIcon
            style={{ color: "darkgray" }}
            title={"Run stopped by the user"}
          />
        );
      case "Killed":
        return (
          <WarningIcon
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
      loading={uiState.loading}
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
                      row.status.includes(searchText),
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
              icon={<RedoIcon />}
              onClick={refreshRunLogs}
            />
            <ToolbarButton
              show={!unauthorisedMethods.includes("clearRunLogs")}
              title="Clear run logs"
              icon={<ClearAllIcon />}
              onClick={clearRunLogs}
            />
          </div>
        )}
      </React.Fragment>
    </MarxanDialog>
  );
};

export default RunLogDialog;

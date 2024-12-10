import React, { useCallback, useEffect, useState } from "react";
import {
  setActiveResultsTab,
  setActiveTab,
  setSnackbarMessage,
  setSnackbarOpen,
  toggleDialog,
  toggleFeatureDialog,
  togglePlanningGridDialog,
  toggleProjectDialog,
} from "./slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "./MarxanDialog";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

const RunSettingsDialog = ({
  loading,
  updateRunParams,
  runParams,
  showClumpingDialog,
  userRole,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );
  const planningGridDialogStates = useSelector(
    (state) => state.ui.planningGridDialogStates
  );
  const [data, setData] = useState([]);
  const [updateEnabled, setUpdateEnabled] = useState(false);

  useEffect(() => {
    if (runParams !== data) {
      setData(props.runParams);
    }
  }, [runParams, data]);

  const openParametersDialog = useCallback(() => {
    props.openParametersDialog();
  }, []);

  const handleUpdateRunParams = useCallback(() => {
    setUpdateEnabled(false);
    if (userRole !== "ReadOnly") {
      updateRunParams(data);
    }
    closeDialog();
  }, [data, closeDialog]);

  const enableUpdate = useCallback(() => {
    setUpdateEnabled(true);
  }, []);

  const handleBlur = useCallback(
    (e, index) => {
      const updatedData = [...data];
      updatedData[index].value = e.target.innerHTML;
      setData(updatedData);
    },
    [data]
  );

  const renderEditable = useCallback(
    (cellInfo) => {
      return userRole === "ReadOnly" ? (
        <div>{data[cellInfo.index]["value"]}</div>
      ) : (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              backgroundColor: "#fafafa",
              float: data[cellInfo.index]["key"] === "BLM" ? "left" : "none",
              flexGrow: 1,
            }}
            contentEditable
            suppressContentEditableWarning
            onFocus={enableUpdate}
            onBlur={(e) => handleBlur(e, cellInfo.index)}
          >
            {data[cellInfo.index]["value"]}
          </div>
          {data[cellInfo.index]["key"] === "BLM" && (
            <FontAwesomeIcon
              icon={faExternalLinkAlt}
              onClick={showClumpingDialog}
              title="Click to open the BLM comparison dialog"
              style={{
                cursor: "pointer",
                marginLeft: "10px",
              }}
            />
          )}
        </div>
      );
    },
    [userRole, data, enableUpdate, handleBlur, showClumpingDialog]
  );

  const closeDialog = () =>
    dispatch(toggleDialog({ dialogName: "settingsDialogOpen", isOpen: false }));

  return (
    <MarxanDialog
      loading={loading}
      open={dialogStates.settingsDialogOpen}
      onOk={handleUpdateRunParams}
      onCancel={() => closeDialog()}
      fullWidth={false}
      maxWidth="md"
      title="Run settings"
    >
      <Table aria-label="run settings table">
        <TableHead>
          <TableRow>
            <TableCell>Parameter</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.key}</TableCell>
              <TableCell>
                {renderEditable({ index, column: { id: "value" } })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MarxanDialog>
  );
};

export default RunSettingsDialog;

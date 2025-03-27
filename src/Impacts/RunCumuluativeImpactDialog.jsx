import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "../MarxanDialog";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { toggleDialog } from "../slices/uiSlice";

const ImportedActivitiesDialog = ({
  loading,
  metadata,
  uploadedActivities,
  userRole,
  runCumulativeImpact,
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
  const [searchText, setSearchText] = useState("");
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);

  const handleSearchChange = (event) =>
    setSearchText(event.target.value.toLowerCase());

  const toggleActivitySelection = (id) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id)
        ? prev.filter((activityId) => activityId !== id)
        : [...prev, id]
    );
  };

  const title = (title, subtitle) => {
    return (
      <div>
        <div>{title}</div>
        <h6>{subtitle}</h6>
      </div>
    );
  };

  const filteredActivities = uploadedActivities.filter(
    (activity) =>
      activity.activity.toLowerCase().includes(searchText) ||
      activity.description.toLowerCase().includes(searchText) ||
      activity.source.toLowerCase().includes(searchText) ||
      activity.created_by.toLowerCase().includes(searchText)
  );

  const handleRunCumulativeImpact = () => {
    runCumulativeImpact(selectedActivityIds);
  };

  const closeDialog = () =>
    dispatch(
      toggleDialog({
        dialogName: "importedActivitiesDialogOpen",
        isOpen: false,
      })
    );

  return (
    <MarxanDialog
      open={dialogStates.importedActivitiesDialogOpen}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      autoDetectWindowHeight={false}
      title={title(
        "Uploaded Activities",
        "Select an uploaded activity and then run"
      )}
      showSearchBox={true}
      searchTextChanged={(e) => handleSearchChange(e)}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Filename</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Creation Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivities.map((activity) => (
              <TableRow
                key={activity.id}
                selected={selectedActivityIds.includes(activity.id)}
                onClick={() => toggleActivitySelection(activity.id)}
                hover
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedActivityIds.includes(activity.id)}
                    onChange={() => toggleActivitySelection(activity.id)}
                  />
                </TableCell>
                <TableCell>{activity.activity}</TableCell>
                <TableCell>{activity.filename}</TableCell>
                <TableCell>{activity.source}</TableCell>
                <TableCell>{activity.created_by}</TableCell>
                <TableCell>{activity.creation_date.substring(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {metadata?.OLDVERSION && (
        <Typography color="error" mt={2}>
          This is an imported project. Only features from this project are
          shown.
        </Typography>
      )}
      <DialogActions>
        <IconButton
          color="primary"
          disabled={
            loading ||
            selectedActivityIds.length === 0 ||
            userRole === "ReadOnly"
          }
          onClick={handleRunCumulativeImpact}
        >
          <FontAwesomeIcon icon={faPlusCircle} />
        </IconButton>
        <Button onClick={() => closeDialog()}>Close</Button>
      </DialogActions>
    </MarxanDialog>
  );
};

export default ImportedActivitiesDialog;

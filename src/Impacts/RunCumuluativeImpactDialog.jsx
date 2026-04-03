import {
  Button,
  Checkbox,
  DialogActions,
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
import { toggleDialog } from "@slices/uiSlice";

const ImportedActivitiesDialog = ({
  loading,
  metadata,
  userRole,
  runCumulativeImpact,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [searchText, setSearchText] = useState("");
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [profileName, setProfileName] = useState("");

  const handleSearchChange = (event) =>
    setSearchText(event.target.value.toLowerCase());

  const toggleActivitySelection = (id) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id)
        ? prev.filter((activityId) => activityId !== id)
        : [...prev, id]
    );
  };

  const title = (title, subtitle) => (
    <div>
      <div>{title}</div>
      <h6>{subtitle}</h6>
    </div>
  );

  const filteredActivities = uiState.uploadedActivities.filter(
    (activity) =>
      activity.activity?.toLowerCase().includes(searchText) ||
      activity.description?.toLowerCase().includes(searchText) ||
      activity.source?.toLowerCase().includes(searchText) ||
      activity.created_by?.toLowerCase().includes(searchText)
  );

  const handleRunCumulativeImpact = () => {
    runCumulativeImpact(selectedActivityIds, profileName);
  };

  const closeDialog = () => {
    setSelectedActivityIds([]);
    setProfileName("");
    dispatch(
      toggleDialog({
        dialogName: "uploadedActivitiesDialogOpen",
        isOpen: false,
      })
    );
  };

  return (
    <MarxanDialog
      open={dialogStates.uploadedActivitiesDialogOpen}
      onOk={closeDialog}
      onCancel={closeDialog}
      autoDetectWindowHeight={false}
      title={title(
        "Uploaded Activities",
        "Select activities and run cumulative impact"
      )}
      showSearchBox={true}
      searchTextChanged={handleSearchChange}
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
                <TableCell>{activity.creation_date?.substring(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TextField
        fullWidth
        value={profileName}
        onChange={(e) => setProfileName(e.target.value)}
        label="Cost profile name"
        variant="outlined"
        sx={{ mt: 2 }}
      />

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
            profileName === "" ||
            userRole === "ReadOnly"
          }
          onClick={handleRunCumulativeImpact}
        >
          <FontAwesomeIcon icon={faPlusCircle} />
        </IconButton>
        <Button onClick={closeDialog}>Close</Button>
      </DialogActions>
    </MarxanDialog>
  );
};

export default ImportedActivitiesDialog;

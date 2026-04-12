import {
  Alert,
  Button,
  Checkbox,
  DialogActions,
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

import MarxanDialog from "../MarxanDialog";
import { toggleDialog } from "@slices/uiSlice";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";

const ImportedActivitiesDialog = ({
  loading,
  metadata,
  userRole,
  runCumulativeImpact,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const selectedFeatureIds = useSelector(
    (state) => state.feature.selectedFeatureIds,
  );
  const { data: allFeaturesResp } = useGetAllFeaturesQuery();
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? [];

  const [searchText, setSearchText] = useState("");
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [profileName, setProfileName] = useState("");

  // Check preprocessing from features already in Redux
  const projectFeatures = allFeatures.filter((f) =>
    selectedFeatureIds.includes(f.id),
  );
  const preprocessedFeatures = projectFeatures.filter((f) => f.preprocessed);
  const unprocessedFeatures = projectFeatures.filter((f) => !f.preprocessed);
  const allPreprocessed =
    projectFeatures.length > 0 && unprocessedFeatures.length === 0;
  const nonePreprocessed =
    projectFeatures.length === 0 || preprocessedFeatures.length === 0;

  const handleSearchChange = (event) =>
    setSearchText(event.target.value.toLowerCase());

  const toggleActivitySelection = (id) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id)
        ? prev.filter((activityId) => activityId !== id)
        : [...prev, id],
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
      activity.created_by?.toLowerCase().includes(searchText),
  );

  const handleRunCumulativeImpact = async () => {
    const response = await runCumulativeImpact(
      selectedActivityIds,
      profileName,
    );
    if (!response?.error) {
      closeDialog();
    }
  };

  const closeDialog = () => {
    setSelectedActivityIds([]);
    setProfileName("");
    dispatch(
      toggleDialog({
        dialogName: "uploadedActivitiesDialogOpen",
        isOpen: false,
      }),
    );
  };

  const canRunImpact =
    !loading &&
    selectedActivityIds.length > 0 &&
    profileName !== "" &&
    userRole !== "ReadOnly" &&
    !nonePreprocessed;

  return (
    <MarxanDialog
      open={dialogStates.uploadedActivitiesDialogOpen}
      hideOKButton={true}
      autoDetectWindowHeight={false}
      title={title(
        "Uploaded Activities",
        "Select activities and run cumulative impact",
      )}
      showSearchBox={true}
      searchTextChanged={handleSearchChange}
    >
      {nonePreprocessed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          No features have been preprocessed for this project. Preprocess your
          features before running the cumulative impact function.
        </Alert>
      )}

      {!allPreprocessed && !nonePreprocessed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {preprocessedFeatures.length} of {projectFeatures.length} features
          preprocessed.
          {unprocessedFeatures.length > 0 && (
            <>
              Missing:{" "}
              {unprocessedFeatures
                .slice(0, 5)
                .map((f) => f.alias)
                .join(", ")}
              {unprocessedFeatures.length > 5 &&
                ` and ${unprocessedFeatures.length - 5} more`}
              .
            </>
          )}
          Unprocessed features will be excluded from the calculation.
        </Alert>
      )}

      {allPreprocessed && (
        <Alert severity="success" sx={{ mb: 2 }}>
          All {projectFeatures.length} features preprocessed.
        </Alert>
      )}

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
                <TableCell>
                  {activity.creation_date?.substring(0, 10)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredActivities.length === 0 && (
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          No activities found.
        </Typography>
      )}

      <TextField
        fullWidth
        value={profileName}
        onChange={(e) => setProfileName(e.target.value)}
        label="Cost profile name"
        variant="outlined"
        sx={{ mt: 2 }}
      />

      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!canRunImpact}
          onClick={handleRunCumulativeImpact}
          title={
            nonePreprocessed
              ? "Preprocess features first"
              : "Run cumulative impact"
          }
        >
          Run Cumulative Impact
        </Button>
      </DialogActions>
    </MarxanDialog>
  );
};

export default ImportedActivitiesDialog;

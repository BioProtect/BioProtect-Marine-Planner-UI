import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import {
  faCheckCircle,
  faPlay,
  faPlusCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  setActivities,
  setUploadedActivities,
  toggleDialog,
} from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "../MarxanDialog";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";

const CumulativeImpactDialog = ({
  _get,
  userRole,
  deleteCost,
  activateCostProfile,
  runCumulativeImpact,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projState = useSelector((state) => state.project);
  const selectedFeatureIds = useSelector(
    (state) => state.feature.selectedFeatureIds,
  );
  const { data: allFeaturesResp } = useGetAllFeaturesQuery();
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? [];

  const [tabIndex, setTabIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // Activities tab state
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");

  const costProfiles = projState.projectCosts || [];

  const filteredProfiles = costProfiles.filter((p) =>
    p.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredActivities = uiState.uploadedActivities.filter(
    (activity) =>
      activity.activity?.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Preprocessing checks
  const projectFeatures = allFeatures.filter((f) =>
    selectedFeatureIds.includes(f.id),
  );
  const preprocessedFeatures = projectFeatures.filter((f) => f.preprocessed);
  const unprocessedFeatures = projectFeatures.filter((f) => !f.preprocessed);
  const allPreprocessed =
    projectFeatures.length > 0 && unprocessedFeatures.length === 0;
  const nonePreprocessed =
    projectFeatures.length === 0 || preprocessedFeatures.length === 0;

  // Pre-select the active cost profile when the dialog opens
  const activeProfile = costProfiles.find((p) => p.is_active);

  // Load activities once when the dialog opens
  const dialogOpen = dialogStates.cumulativeImpactDialogOpen;
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      setSelectedProfileId(activeProfile?.id ?? null);
    }
  }, [dialogOpen, activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (dialogOpen && !activitiesLoaded) {
      setActivitiesLoaded(true);
      _get("getUploadedActivities").then((resp) => {
        if (resp?.data) {
          dispatch(setUploadedActivities(resp.data));
        }
      });
    }
    if (!dialogOpen) {
      setActivitiesLoaded(false);
    }
  }, [dialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const openHumanActivitiesDialog = useCallback(async () => {
    if (uiState.activities.length < 1) {
      const response = await _get("getActivities");
      const data = JSON.parse(response.data);
      dispatch(setActivities(data));
    }
    dispatch(
      toggleDialog({ dialogName: "humanActivitiesDialogOpen", isOpen: true }),
    );
  }, [_get, uiState.activities, dispatch]);

  const selectedProfile = costProfiles.find((p) => p.id === selectedProfileId);

  const handleActivateProfile = useCallback(async () => {
    if (selectedProfileId && activateCostProfile) {
      await activateCostProfile(selectedProfileId);
    }
  }, [selectedProfileId, activateCostProfile]);

  const handleDeleteCost = useCallback(async () => {
    if (selectedProfile && deleteCost) {
      const response = await deleteCost(selectedProfile.id);
      if (!response?.error) {
        setSelectedProfileId(null);
      }
    }
  }, [selectedProfile, deleteCost]);

  const toggleActivitySelection = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedActivityIds((prev) =>
      prev.includes(id)
        ? prev.filter((activityId) => activityId !== id)
        : [...prev, id],
    );
  };

  const toggleProfileSelection = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedProfileId((prev) => (prev === id ? null : id));
  };

  const handleRunCumulativeImpact = async () => {
    const response = await runCumulativeImpact(
      selectedActivityIds,
      profileName,
      profileDescription,
    );
    if (!response?.error) {
      setSelectedActivityIds([]);
      setProfileName("");
      setProfileDescription("");
      setTabIndex(0);
    }
  };

  const canRunImpact =
    !uiState.loading &&
    selectedActivityIds.length > 0 &&
    profileName !== "" &&
    userRole !== "ReadOnly" &&
    !nonePreprocessed;

  const closeDialog = () => {
    setSelectedProfileId(null);
    setSearchText("");
    setSelectedActivityIds([]);
    setProfileName("");
    setProfileDescription("");
    dispatch(
      toggleDialog({
        dialogName: "cumulativeImpactDialogOpen",
        isOpen: false,
      }),
    );
  };

  return (
    <MarxanDialog
      open={dialogStates.cumulativeImpactDialogOpen}
      onOk={closeDialog}
      onCancel={closeDialog}
      loading={uiState.loading}
      autoDetectWindowHeight={false}
      title="Cumulative Impact"
      showSearchBox={true}
      searchText={searchText}
      searchTextChanged={setSearchText}
      fullWidth={true}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
          <Tab label="Cost Profiles" />
          <Tab label="Activities" />
        </Tabs>
      </Box>

      {/* ── Cost Profiles Tab ── */}
      {tabIndex === 0 && (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow
                    key={profile.id}
                    hover
                    selected={selectedProfileId === profile.id}
                    onClick={() => toggleProfileSelection(profile.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProfileId === profile.id}
                        onChange={(e) => toggleProfileSelection(profile.id, e)}
                      />
                    </TableCell>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell align="right">
                      {profile.is_active && (
                        <Chip label="Active" color="primary" size="small" />
                      )}
                      {profile.is_default && !profile.is_active && (
                        <Chip label="Default" size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No cost profiles found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <ButtonGroup
            aria-label="Cost profile actions"
            fullWidth
            sx={{ mt: 2 }}
          >
            <Button
              startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
              title="Set selected cost profile as active"
              onClick={handleActivateProfile}
              disabled={
                !selectedProfile ||
                selectedProfile.is_active ||
                uiState.loading ||
                userRole === "ReadOnly"
              }
            >
              Activate
            </Button>

            <Button
              startIcon={
                <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
              }
              title="Delete selected cost profile"
              onClick={handleDeleteCost}
              disabled={
                !selectedProfile ||
                selectedProfile.is_active ||
                uiState.loading ||
                userRole === "ReadOnly"
              }
            >
              Delete
            </Button>
          </ButtonGroup>
        </>
      )}

      {/* ── Activities Tab ── */}
      {tabIndex === 1 && (
        <>
          {nonePreprocessed && (
            <Alert severity="error" sx={{ mb: 2 }}>
              No features have been preprocessed. Preprocess your features
              before running the cumulative impact function.
            </Alert>
          )}

          {!allPreprocessed && !nonePreprocessed && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {preprocessedFeatures.length} of {projectFeatures.length} features
              preprocessed.
              {unprocessedFeatures.length > 0 && (
                <>
                  {" "}
                  Missing:{" "}
                  {unprocessedFeatures
                    .slice(0, 5)
                    .map((f) => f.alias)
                    .join(", ")}
                  {unprocessedFeatures.length > 5 &&
                    ` and ${unprocessedFeatures.length - 5} more`}
                  .
                </>
              )}{" "}
              Unprocessed features will be excluded.
            </Alert>
          )}

          {allPreprocessed && (
            <Alert severity="success" sx={{ mb: 2 }}>
              All {projectFeatures.length} features preprocessed.
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow
                    key={activity.id}
                    selected={selectedActivityIds.includes(activity.id)}
                    onClick={() => toggleActivitySelection(activity.id)}
                    hover
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedActivityIds.includes(activity.id)}
                        onChange={(e) =>
                          toggleActivitySelection(activity.id, e)
                        }
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
                {filteredActivities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No activities uploaded.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TextField
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            label="Cost profile name"
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            label="Description"
            variant="outlined"
            size="small"
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />

          <ButtonGroup aria-label="Activity actions" fullWidth sx={{ mt: 2 }}>
            <Button
              startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
              title="Upload a new activity"
              onClick={openHumanActivitiesDialog}
              disabled={uiState.loading || userRole === "ReadOnly"}
            >
              Add Activity
            </Button>

            <Button
              startIcon={<FontAwesomeIcon icon={faPlay} />}
              title={
                nonePreprocessed
                  ? "Preprocess features first"
                  : "Run cumulative impact"
              }
              onClick={handleRunCumulativeImpact}
              disabled={!canRunImpact}
            >
              Run Cumulative Impact
            </Button>
          </ButtonGroup>
        </>
      )}
    </MarxanDialog>
  );
};

export default CumulativeImpactDialog;

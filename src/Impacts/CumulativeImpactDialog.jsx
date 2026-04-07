import React, { useCallback, useState } from "react";
import {
  setActivities,
  setUploadedActivities,
  toggleDialog,
} from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import {
  Button,
  ButtonGroup,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faPlay,
  faTrashAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import MarxanDialog from "../MarxanDialog";

const CumulativeImpactDialog = ({
  _get,
  userRole,
  deleteCost,
  activateCostProfile,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projState = useSelector((state) => state.project);

  const [searchText, setSearchText] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const costProfiles = projState.projectCosts || [];

  const filteredProfiles = costProfiles.filter((p) =>
    p.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

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

  const openRunCumulativeImpactDialog = useCallback(async () => {
    const activitiesData = await _get("getUploadedActivities");
    if (activitiesData?.data) {
      dispatch(setUploadedActivities(activitiesData.data));
    }
    dispatch(
      toggleDialog({
        dialogName: "uploadedActivitiesDialogOpen",
        isOpen: true,
      }),
    );
  }, [_get, dispatch]);

  const handleActivateProfile = useCallback(async () => {
    if (selectedProfile && activateCostProfile) {
      await activateCostProfile(selectedProfile.id);
      setSelectedProfile(null);
    }
  }, [selectedProfile, activateCostProfile]);

  const handleDeleteCost = useCallback(() => {
    if (selectedProfile && deleteCost) {
      deleteCost(selectedProfile.name);
      setSelectedProfile(null);
    }
  }, [selectedProfile, deleteCost]);

  const closeDialog = () => {
    setSelectedProfile(null);
    setSearchText("");
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
      title="Cost Profiles"
      showSearchBox={true}
      searchText={searchText}
      searchTextChanged={setSearchText}
      fullWidth={true}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow
                key={profile.id}
                hover
                selected={selectedProfile?.id === profile.id}
                onClick={() => setSelectedProfile(profile)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{profile.name}</TableCell>
                <TableCell>{profile.description}</TableCell>
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
                    No cost profiles found. Upload an activity and run the
                    cumulative impact function to create one.
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
          startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
          title="Upload a new activity"
          onClick={openHumanActivitiesDialog}
          disabled={uiState.loading || userRole === "ReadOnly"}
        >
          Add Activity
        </Button>

        <Button
          startIcon={<FontAwesomeIcon icon={faPlay} />}
          title="Run cumulative impact to create a new cost profile"
          onClick={openRunCumulativeImpactDialog}
          disabled={uiState.loading || userRole === "ReadOnly"}
        >
          Run Cumulative Impact
        </Button>

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
    </MarxanDialog>
  );
};

export default CumulativeImpactDialog;

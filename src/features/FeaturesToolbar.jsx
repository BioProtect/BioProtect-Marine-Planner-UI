import React, { useState } from "react";
import {
  faCheckCircle,
  faPlusCircle,
  faTimesCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { setAllFeatures, setSelectedFeature, setSelectedFeatureIds, toggleFeatureD, useDeleteFeatureMutation } from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const FeaturesToolbar = ({
  metadata,
  userRole,
  selectAllFeatures,
  _newByDigitising }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);

  const [newAnchorEl, setNewAnchorEl] = useState(null);
  const [importAnchorEl, setImportAnchorEl] = useState(null);
  const newOpen = Boolean(newAnchorEl);
  const importOpen = Boolean(importAnchorEl);
  const [deleteFeature, { isLoading }] = useDeleteFeatureMutation();



  const handleNewClick = (event) => setNewAnchorEl(event.currentTarget);
  const handleImportClick = (event) => setImportAnchorEl(event.currentTarget);
  const handleClose = () => {
    setNewAnchorEl(null);
    setImportAnchorEl(null);
  };

  const handleOpenImportFeaturesDialog = () => {
    dispatch(
      toggleFeatureD({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "importFeaturesDialogOpen",
        isOpen: true,
      })
    );
  };

  const handleOpenImportFromWebDialog = () => {
    dispatch(
      toggleFeatureD({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "importFromWebDialogOpen",
        isOpen: true,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
  };



  const handleDeleteFeature = async () => {
    try {
      let feature = { ...featureState.feature }
      // check if any projects are using feature
      const projects = await getProjectsForFeature(feature);
      if (projects.length === 0) {
        // Unwrap to handle the response
        await deleteFeature(feature.feature_class_name).unwrap();
        const updatedFeatureIds = uiState.selectedFeatureIds.filter((id) => id !== feature.id);
        const updatedFeatures = uiState.allFeatures.filter((item) => item.id !== feature.id);
        dispatch(setSnackbarOpen(true));
        dispatch(setSnackbarMessage("Feature deleted"));
        dispatch(setSelectedFeatureIds(updatedFeatureIds));
        dispatch(setAllFeatures(updatedFeatures));
        dispatch(setSelectedFeature({}));
      } else {
        // Projects using the feature, show dialog to the user
        showProjectListDialog(
          projects,
          "Failed to delete planning feature",
          "The feature is used in the following projects"
        );
      }
    } catch (err) {
      console.error("Error deleting feature:", err);
      dispatch(setSnackbarOpen(true));
      dispatch(setSnackbarMessage("Failed to delete feature due to an error."));
    }
  };

  return (
    <div>
      <div
        style={{
          display: metadata.OLDVERSION ? "block" : "none",
        }}
        className={"tabTitle"}
      >
        This is an imported project. Only features from this project are shown.
      </div>

      <ButtonGroup aria-label="Basic button group" fullWidth={true}>
        {userRole !== "ReadOnly" &&
          !metadata.OLDVERSION &&
          !featureState.addingRemovingFeatures ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="New feature"
            disabled={uiState.loading}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleNewClick}
          >
            New
          </Button>
        ) : null}

        <Menu open={newOpen} anchorEl={newAnchorEl} onClose={handleClose}>
          <MenuItem
            title="Create a new feature by digitising it on the screen"
            onClick={() => _newByDigitising()}
          >
            Draw on screen
          </MenuItem>
        </Menu>

        {!metadata.OLDVERSION &&
          !featureState.addingRemovingFeatures &&
          userRole !== "ReadOnly" ? (
          <Button
            startIcon={<Import style={{ height: "20px", width: "20px" }} />}
            title="Create new features from existing data"
            disabled={uiState.loading}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleImportClick}
          >
            Import
          </Button>
        ) : null}

        <Menu open={importOpen} anchorEl={importAnchorEl} onClose={handleClose}>
          <MenuItem
            title="From a shapefile"
            onClick={() => handleOpenImportFeaturesDialog()}
          >
            Import one or more features from a shapefile
          </MenuItem>
          <MenuItem
            title="From the web"
            onClick={() => handleOpenImportFromWebDialog()}
          >
            Import one or more features from a web resource
          </MenuItem>
          <MenuItem
            title="From the IUCN Red List of Threatened Species"
            disabled={true}
          >
            From the IUCN Red List of Threatened Species
          </MenuItem>
        </Menu>

        {userRole === "Admin" &&
          !metadata.OLDVERSION &&
          !featureState.addingRemovingFeatures ? (
          <Button
            startIcon={
              <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
            }
            title="Delete feature"
            disabled={
              featureState.selectedFeature === undefined ||
              uiState.loading ||
              (featureState.selectedFeature &&
                featureState.selectedFeature.created_by === "global admin")
            }
            onClick={() => handleDeleteFeature()}
          >
            Delete
          </Button>
        ) : null}

        {featureState.addingRemovingFeatures ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faTimesCircle} />}
            title="Clear all features"
            onClick={() => dispatch(setSelectedFeatureIds([]))}
          >
            Clear all
          </Button>
        ) : null}
        {featureState.addingRemovingFeatures ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
            title="Select all features"
            onClick={() => selectAllFeatures()}
          >
            Select all
          </Button>
        ) : null}
      </ButtonGroup>
    </div >
  );
};
export default FeaturesToolbar;

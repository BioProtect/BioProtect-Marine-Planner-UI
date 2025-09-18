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
import useAppSnackbar from "@hooks/useAppSnackbar";

const FeaturesToolbar = ({
  selectAllFeatures,
  _newByDigitising }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);

  const [newAnchorEl, setNewAnchorEl] = useState(null);
  const [importAnchorEl, setImportAnchorEl] = useState(null);
  const [deleteFeature, { isLoading }] = useDeleteFeatureMutation();

  const newOpen = Boolean(newAnchorEl);
  const importOpen = Boolean(importAnchorEl);
  const { showMessage } = useAppSnackbar();

  const handleNewClick = (event) => setNewAnchorEl(event.currentTarget);
  const handleImportClick = (event) => setImportAnchorEl(event.currentTarget);
  const handleClose = () => {
    setNewAnchorEl(null);
    setImportAnchorEl(null);
  };

  const handleOpenImportFeaturesDialog = () => {
    dispatch(toggleFeatureD({ dialogName: "newFeaturePopoverOpen", isOpen: false }));
    dispatch(toggleFeatureD({ dialogName: "importFeaturePopoverOpen", isOpen: false }));
    dispatch(toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }));
    dispatch(toggleFeatureD({ dialogName: "importFeaturesDialogOpen", isOpen: true }));
  };

  const handleOpenImportFromWebDialog = () => {
    dispatch(toggleFeatureD({ dialogName: "newFeaturePopoverOpen", isOpen: false }));
    dispatch(toggleFeatureD({ dialogName: "importFeaturePopoverOpen", isOpen: false }));
    dispatch(toggleFeatureD({ dialogName: "importFromWebDialogOpen", isOpen: true }));
    dispatch(toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }));
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
        showMessage("Feature deleted", "success");
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
      showMessage("Failed to delete feature due to an error.", "error");
    }
  };

  return (
    <>
      {!featureState.addingRemovingFeatures ? (
        <ButtonGroup aria-label="Feature actions" fullWidth>
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="New feature"
            disabled={uiState.loading}
            onClick={handleNewClick}
          >
            New
          </Button>

          <Menu open={newOpen} anchorEl={newAnchorEl} onClose={handleClose}>
            <MenuItem
              title="Create a new feature by digitising it on the screen"
              onClick={() => _newByDigitising()}
            >
              Draw on screen
            </MenuItem>
          </Menu>

          <Button
            startIcon={<Import style={{ height: 20, width: 20 }} />}
            title="Create new features from existing data"
            disabled={uiState.loading}
            onClick={handleImportClick}
          >
            Import
          </Button>

          <Menu open={importOpen} anchorEl={importAnchorEl} onClose={handleClose}>
            <MenuItem
              title="From a shapefile"
              onClick={handleOpenImportFeaturesDialog}
            >
              Import one or more features from a shapefile
            </MenuItem>
            <MenuItem
              title="From the web"
              onClick={handleOpenImportFromWebDialog}
            >
              Import one or more features from a web resource
            </MenuItem>
            <MenuItem
              title="From the IUCN Red List of Threatened Species"
              disabled
            >
              From the IUCN Red List of Threatened Species
            </MenuItem>
          </Menu>

          <Button
            startIcon={<FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />}
            title="Delete feature"
            disabled={
              featureState.selectedFeature === undefined ||
              uiState.loading ||
              (featureState.selectedFeature?.created_by === "global admin")
            }
            onClick={handleDeleteFeature}
          >
            Delete
          </Button>
        </ButtonGroup>
      ) : (
        <ButtonGroup aria-label="Batch feature controls" fullWidth>
          <Button
            startIcon={<FontAwesomeIcon icon={faTimesCircle} />}
            title="Clear all features"
            onClick={() => dispatch(setSelectedFeatureIds([]))}
          >
            Clear all
          </Button>
          <Button
            startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
            title="Select all features"
            onClick={selectAllFeatures}
          >
            Select all
          </Button>
        </ButtonGroup>
      )}
    </>
  );
};

export default FeaturesToolbar;

import React, { useState } from "react";
import {
  faCheckCircle,
  faPlusCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  setSelectedFeatureIds,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const FeaturesToolbar = ({
  selectAllFeatures,
  _newByDigitising,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);

  const [newAnchorEl, setNewAnchorEl] = useState(null);
  const [importAnchorEl, setImportAnchorEl] = useState(null);

  const newOpen = Boolean(newAnchorEl);
  const importOpen = Boolean(importAnchorEl);

  const handleNewClick = (event) => setNewAnchorEl(event.currentTarget);
  const handleImportClick = (event) => setImportAnchorEl(event.currentTarget);
  const handleClose = () => {
    setNewAnchorEl(null);
    setImportAnchorEl(null);
  };

  const handleOpenImportFeaturesDialog = () => {
    dispatch(
      toggleFeatureD({ dialogName: "newFeaturePopoverOpen", isOpen: false })
    );
    dispatch(
      toggleFeatureD({ dialogName: "importFeaturePopoverOpen", isOpen: false })
    );
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false })
    );
    dispatch(
      toggleFeatureD({ dialogName: "importFeaturesDialogOpen", isOpen: true })
    );
  };

  const handleOpenImportFromWebDialog = () => {
    dispatch(
      toggleFeatureD({ dialogName: "newFeaturePopoverOpen", isOpen: false })
    );
    dispatch(
      toggleFeatureD({ dialogName: "importFeaturePopoverOpen", isOpen: false })
    );
    dispatch(
      toggleFeatureD({ dialogName: "importFromWebDialogOpen", isOpen: true })
    );
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false })
    );
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

          <Menu
            open={importOpen}
            anchorEl={importAnchorEl}
            onClose={handleClose}
          >
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

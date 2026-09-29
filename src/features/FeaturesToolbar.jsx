import React, { useState } from "react";
import { setSelectedFeatureIds, toggleFeatureD } from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import Import from "@mui/icons-material/GetApp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const FeaturesToolbar = ({ selectAllFeatures }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);

  const [newAnchorEl, setNewAnchorEl] = useState(null);
  const [importAnchorEl, setImportAnchorEl] = useState(null);

  const newOpen = Boolean(newAnchorEl);
  const importOpen = Boolean(importAnchorEl);

  const handleClose = () => {
    setNewAnchorEl(null);
    setImportAnchorEl(null);
  };

  const handleOpenImportFeaturesDialog = () => {
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }),
    );
    dispatch(
      toggleFeatureD({ dialogName: "importFeaturesDialogOpen", isOpen: true }),
    );
  };

  return (
    <>
      {!featureState.addingRemovingFeatures ? (
        <Button
          mt={10}
          variant="contained"
          startIcon={<Import style={{ height: 20, width: "100%" }} />}
          title="Create new features from existing data"
          disabled={uiState.loading}
          onClick={handleOpenImportFeaturesDialog}
        >
          Import
        </Button>
      ) : (
        <ButtonGroup aria-label="Batch feature controls" fullWidth>
          <Button
            startIcon={<ClearAllIcon />}
            title="Clear all features"
            onClick={() => dispatch(setSelectedFeatureIds([]))}
          >
            Clear all
          </Button>
          <Button
            startIcon={<CheckBoxIcon />}
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

import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AddToMap from "@mui/icons-material/Visibility";
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from "@mui/material/Menu";
import MenuItem from '@mui/material/MenuItem';
import Preprocess from "@mui/icons-material/Autorenew";
import Properties from "@mui/icons-material/ErrorOutline";
import RemoveFromMap from "@mui/icons-material/VisibilityOff";
import RemoveFromProject from "@mui/icons-material/Remove";
import ZoomIn from "@mui/icons-material/ZoomIn";
import { generateTableCols } from "../Helpers";
import { selectCurrentUser } from "@slices/authSlice";
import { toggleFeatureD } from "@slices/featureSlice";

const FeatureMenu = ({
  anchorEl,
  removeFromProject,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  zoomToFeature,
  preprocessSingleFeature,
  preprocessing,
}) => {
  const dispatch = useDispatch();
  const featureState = useSelector((state) => state.feature);
  const userData = useSelector(selectCurrentUser);

  const handleInfoMenuItemClick = () => {
    dispatch(
      toggleFeatureD({ dialogName: "featureInfoDialogOpen", isOpen: true })
    );
    closeDialog();
  };

  const closeDialog = () =>
    dispatch(
      toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: false })
    );
  return (
    <Menu
      open={featureState.dialogs.featureMenuOpen}
      anchorEl={anchorEl}
      onClose={() => closeDialog()}
      onMouseLeave={closeDialog}
    >
      <MenuItem onClick={() => removeFromProject(featureState.currentFeature)}>
        <ListItemIcon>
          <RemoveFromProject />
        </ListItemIcon>
        Remove from Project
      </MenuItem>

      <MenuItem onClick={() => handleInfoMenuItemClick()}>
        <ListItemIcon>
          <Properties />
        </ListItemIcon>
        Feature Properties
      </MenuItem>

      <MenuItem onClick={() => toggleFeatureLayer(featureState.currentFeature)}>
        <ListItemIcon>
          {featureState.currentFeature?.feature_layer_loaded ? (
            <RemoveFromMap />
          ) : (
            <AddToMap />
          )}
        </ListItemIcon>
        {featureState.currentFeature?.feature_puid_layer_loaded
          ? "Remove from Map"
          : "Add to Map"}
      </MenuItem>

      <MenuItem onClick={() => toggleFeaturePUIDLayer(featureState.currentFeature)}>
        <ListItemIcon>
          {featureState.currentFeature?.feature_puid_layer_loaded ? (
            <RemoveFromMap />
          ) : (
            <AddToMap />
          )}
        </ListItemIcon>
        {featureState.currentFeature?.feature_puid_layer_loaded
          ? "Remove planning unit outlines"
          : "Outline planning units where the feature occurs"}
      </MenuItem>

      <MenuItem onClick={() => zoomToFeature(featureState.currentFeature)}>
        <ListItemIcon>
          <ZoomIn />
        </ListItemIcon>
        Zoom to Feature
      </MenuItem>

      <MenuItem
        onClick={() => preprocessSingleFeature(featureState.currentFeature)}
        disabled={featureState.currentFeature?.preprocessed || preprocessing}>
        <ListItemIcon>
          <Preprocess />
        </ListItemIcon>
        Preprocess Feature
      </MenuItem>
    </Menu>
  );
};

export default FeatureMenu;

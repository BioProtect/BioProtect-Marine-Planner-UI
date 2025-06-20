import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AddToMap from "@mui/icons-material/Visibility";
import Menu from "@mui/material/Menu";
import MenuItemWithButton from "../MenuItemWithButton";
import Popover from "@mui/material/Popover";
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
  const uiState = useSelector((state) => state.ui);
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
      <MenuItemWithButton
        leftIcon={<Properties style={{ margin: "1px" }} />}
        onClick={() => handleInfoMenuItemClick()}
      >
        Properties
      </MenuItemWithButton>
      <MenuItemWithButton
        leftIcon={<RemoveFromProject style={{ margin: "1px" }} />}
        style={{
          display:
            uiState.currentFeature?.old_version || userData.role === "ReadOnly"
              ? "none"
              : "block",
        }}
        onClick={() => removeFromProject(uiState.currentFeature)}
      >
        Remove from project
      </MenuItemWithButton>
      <MenuItemWithButton
        leftIcon={
          uiState.currentFeature?.feature_layer_loaded ? (
            <RemoveFromMap style={{ margin: "1px" }} />
          ) : (
            <AddToMap style={{ margin: "1px" }} />
          )
        }
        style={{
          display: uiState.currentFeature?.tilesetid ? "block" : "none",
        }}
        onClick={() => toggleFeatureLayer(uiState.currentFeature)}
      >
        {uiState.currentFeature?.feature_layer_loaded
          ? "Remove from map"
          : "Add to map"}
      </MenuItemWithButton>
      <MenuItemWithButton
        leftIcon={
          uiState.currentFeature?.feature_puid_layer_loaded ? (
            <RemoveFromMap style={{ margin: "1px" }} />
          ) : (
            <AddToMap style={{ margin: "1px" }} />
          )
        }
        onClick={() => toggleFeaturePUIDLayer(uiState.currentFeature)}
        disabled={
          !(
            uiState.currentFeature?.preprocessed &&
            uiState.currentFeature.occurs_in_planning_grid
          )
        }
      >
        {uiState.currentFeature?.feature_puid_layer_loaded
          ? "Remove planning unit outlines"
          : "Outline planning units where the feature occurs"}
      </MenuItemWithButton>
      <MenuItemWithButton
        leftIcon={<ZoomIn style={{ margin: "1px" }} />}
        style={{
          display: uiState.currentFeature?.extent ? "block" : "none",
        }}
        onClick={() => zoomToFeature(uiState.currentFeature)}
      >
        Zoom to feature extent
      </MenuItemWithButton>
      <MenuItemWithButton
        leftIcon={<Preprocess style={{ margin: "1px" }} />}
        style={{
          display:
            uiState.currentFeature?.old_version || userData.role === "ReadOnly"
              ? "none"
              : "block",
        }}
        onClick={() => preprocessSingleFeature(uiState.currentFeature)}
        disabled={uiState.currentFeature?.preprocessed || preprocessing}
      >
        Pre-process
      </MenuItemWithButton>
    </Menu>
    // </Popover>
  );
};

export default FeatureMenu;

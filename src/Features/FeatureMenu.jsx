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
import { toggleFeatureDialog } from "../slices/uiSlice";

const FeatureMenu = ({
  anchorEl,
  removeFromProject,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  zoomToFeature,
  preprocessSingleFeature,
  currentFeature,
  userData,
  preprocessing,
}) => {
  const dispatch = useDispatch();
  const featureStates = useSelector((state) => state.ui.featureDialogStates);

  const handleInfoMenuItemClick = () => {
    dispatch(
      toggleFeatureDialog({ dialogName: "featureInfoDialogOpen", isOpen: true })
    );
    closeDialog();
  };

  const closeDialog = () =>
    dispatch(
      toggleFeatureDialog({ dialogName: "featureMenuOpen", isOpen: false })
    );
  return (
    <Popover
      open={featureStates.featureMenuOpen}
      anchorEl={anchorEl}
      onClose={closeDialog}
      style={{ width: "307px" }}
    >
      <Menu style={{ width: "207px" }} onMouseLeave={closeDialog} open={false}>
        <MenuItemWithButton
          leftIcon={<Properties style={{ margin: "1px" }} />}
          onClick={handleInfoMenuItemClick}
        >
          Properties
        </MenuItemWithButton>
        <MenuItemWithButton
          leftIcon={<RemoveFromProject style={{ margin: "1px" }} />}
          style={{
            display:
              currentFeature?.old_version || userData.ROLE === "ReadOnly"
                ? "none"
                : "block",
          }}
          onClick={() => removeFromProject(currentFeature)}
        >
          Remove from project
        </MenuItemWithButton>
        <MenuItemWithButton
          leftIcon={
            currentFeature?.feature_layer_loaded ? (
              <RemoveFromMap style={{ margin: "1px" }} />
            ) : (
              <AddToMap style={{ margin: "1px" }} />
            )
          }
          style={{
            display: currentFeature?.tilesetid ? "block" : "none",
          }}
          onClick={() => toggleFeatureLayer(currentFeature)}
        >
          {currentFeature?.feature_layer_loaded
            ? "Remove from map"
            : "Add to map"}
        </MenuItemWithButton>
        <MenuItemWithButton
          leftIcon={
            currentFeature?.feature_puid_layer_loaded ? (
              <RemoveFromMap style={{ margin: "1px" }} />
            ) : (
              <AddToMap style={{ margin: "1px" }} />
            )
          }
          onClick={() => toggleFeaturePUIDLayer(currentFeature)}
          disabled={
            !(
              currentFeature?.preprocessed &&
              currentFeature.occurs_in_planning_grid
            )
          }
        >
          {currentFeature?.feature_puid_layer_loaded
            ? "Remove planning unit outlines"
            : "Outline planning units where the feature occurs"}
        </MenuItemWithButton>
        <MenuItemWithButton
          leftIcon={<ZoomIn style={{ margin: "1px" }} />}
          style={{
            display: currentFeature?.extent ? "block" : "none",
          }}
          onClick={() => zoomToFeature(currentFeature)}
        >
          Zoom to feature extent
        </MenuItemWithButton>
        <MenuItemWithButton
          leftIcon={<Preprocess style={{ margin: "1px" }} />}
          style={{
            display:
              currentFeature?.old_version || userData.ROLE === "ReadOnly"
                ? "none"
                : "block",
          }}
          onClick={() => preprocessSingleFeature(currentFeature)}
          disabled={currentFeature?.preprocessed || preprocessing}
        >
          Pre-process
        </MenuItemWithButton>
      </Menu>
    </Popover>
  );
};

export default FeatureMenu;

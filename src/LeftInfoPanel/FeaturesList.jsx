import React, { useState } from "react";
import {
  setCurrentFeature,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import IconButton from "@mui/material/IconButton";
import LinearGauge from "../LinearGauge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TargetIcon from "../TargetIcon";
import { grey } from "@mui/material/colors";
import { selectCurrentUser } from "@slices/authSlice";
import { setProjectFeatures } from "@slices/projectSlice";

const FeaturesList = ({
  simple,
  updateFeature,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  useFeatureColors,
  smallLinearGauge,
  setMenuAnchor
}) => {

  const userData = useSelector(selectCurrentUser);
  const projState = useSelector((state) => state.project);
  const dispatch = useDispatch();


  const handleIconClick = (evt, feature) => {
    evt.stopPropagation();
    setMenuAnchor(evt.target);
    dispatch(setCurrentFeature(feature));
    dispatch(
      toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: true })
    );
  };

  const handleItemClick = (evt, feature) => {
    if (simple) return;

    const key = evt.altKey
      ? "feature_puid_layer_loaded"
      : "feature_layer_loaded";

    // clone + flip whichever flag
    const updated = {
      ...feature,
      [key]: !feature[key]
    };

    // update the map
    evt.altKey
      ? toggleFeaturePUIDLayer(updated)
      : toggleFeatureLayer(updated);

    // and sync your Redux slice
    dispatch(setProjectFeatures(
      projState.projectFeatures.map(f =>
        f.id === updated.id ? updated : f
      )
    ));
  };

  const handleTargetChange = (targetIcon, newValue) => {
    updateFeature(targetIcon.props.interestFeature, {
      target_value: newValue,
    });
  };

  return (
    <List
      sx={{
        maxHeight: 440,
        overflowY: "auto", // ensures scroll
        border: "1px solid #e0e0e0", // optional: visual separation
        borderRadius: 1, // optional: rounded corners
      }}>
      {projState.projectFeatures.map((item) => {
        const { pu_area, protected_area, target_value, color } = item;
        let protectedPercent;
        if (protected_area === -1) {
          protectedPercent = -1;
        } else if (pu_area > 0 && protected_area > 0) {
          protectedPercent = (protected_area / pu_area) * 100;
        } else {
          protectedPercent = 0;
        }

        return (
          <ListItem key={item.id}>
            <ListItemButton onClick={(evt) => handleItemClick(evt, item)}>
              {!simple && (
                <ListItemIcon>
                  <TargetIcon
                    target_value={target_value}
                    updateTargetValue={handleTargetChange}
                    interestFeature={item}
                    targetStatus={
                      pu_area === 0
                        ? "Does not occur in planning area"
                        : protectedPercent === -1
                          ? "Unknown"
                          : protected_area >= item.target_area
                            ? "Target achieved"
                            : "Target missed"
                    }
                    visible={pu_area !== 0}
                  />
                </ListItemIcon>
              )}

              <ListItemText
                primary={item.alias}
                primaryTypographyProps={{ variant: "body2" }}
                sx={{ ml: simple ? 0 : 1 }}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                  !simple && (
                    <LinearGauge
                      scaledWidth={220}
                      target_value={target_value}
                      protected_percent={protectedPercent}
                      visible={pu_area !== 0}
                      color={color}
                      useFeatureColors={useFeatureColors}
                      sx={{ mt: 0.5, height: smallLinearGauge ? 3 : 'auto' }}
                      smallLinearGauge={smallLinearGauge}
                    />
                  )
                }
              />

              {!simple && (
                <IconButton
                  edge="end"
                  onClick={(evt) => handleIconClick(evt, item)}
                >
                  <MoreVertIcon sx={{ color: grey[400] }} />
                </IconButton>
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default FeaturesList;

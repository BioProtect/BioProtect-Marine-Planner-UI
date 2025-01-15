import IconButton from "@mui/material/IconButton";
import LinearGauge from "../LinearGauge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import TargetIcon from "../TargetIcon";
import { grey } from "@mui/material/colors";
import { selectUserData } from "../slices/authSlice";
import { useSelector } from "react-redux";

const FeaturesList = ({
  features,
  openFeatureMenu,
  simple,
  updateFeature,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  useFeatureColors,
  smallLinearGauge,
}) => {
  const userData = useSelector(selectUserData);
  const iconClick = (feature, evt) => {
    openFeatureMenu(evt, feature);
  };

  const updateTargetValue = (targetIcon, newValue) => {
    console.log("targetIcon, newValue ", targetIcon, newValue);

    updateFeature(targetIcon.props.interestFeature, {
      target_value: newValue,
    });
  };

  const itemClick = (feature, evt) => {
    if (evt.altKey) {
      // Toggle the layers puid visibility and add remove it from map
      feature.feature_puid_layer_loaded = !feature.feature_puid_layer_loaded;
      toggleFeaturePUIDLayer(feature);
    } else {
      // Toggle the layers visibility and add remove it from map
      feature.feature_layer_loaded = !feature.feature_layer_loaded;
      toggleFeatureLayer(feature);
    }
  };

  return (
    <List>
      {features.map((item) => {
        // Get the total area of the feature in the planning unit
        let { pu_area } = item;

        // Get the protected percent
        let protected_percent =
          item.protected_area === -1
            ? -1
            : pu_area >= 0
              ? item.protected_area > 0
                ? (item.protected_area / pu_area) * 100
                : 0
              : 0;

        let targetStatus =
          pu_area === 0
            ? "Does not occur in planning area"
            : protected_percent === -1
              ? "Unknown"
              : item.protected_area >= item.target_area
                ? "Target achieved"
                : "Target missed";

        return (
          <ListItem
            key={item.id}
            onClick={simple ? null : (evt) => itemClick(item, evt)}
            sx={{
              borderRadius: "3px",
              fontSize: "13px",
              color: "rgba(0,0,0,0.8)",
              padding: simple ? "5px 5px 5px 5px" : "6px 5px 2px 40px",
            }}
          >
            {!simple && (
              <TargetIcon
                sx={{ left: 8 }}
                target_value={item.target_value}
                updateTargetValue={updateTargetValue}
                interestFeature={item}
                targetStatus={targetStatus}
                visible={item.pu_area !== 0}
              />
            )}
            {item.alias}
            {!simple && (
              <LinearGauge
                scaledWidth={220}
                target_value={item.target_value}
                protected_percent={protected_percent}
                visible={item.pu_area !== 0}
                color={item.color}
                useFeatureColors={useFeatureColors}
                sx={{
                  height: smallLinearGauge ? "3px" : "unset",
                }}
                smallLinearGauge={smallLinearGauge}
              />
            )}
            {!simple && (
              <IconButton
                onClick={(evt) => iconClick(item, evt)}
                sx={{
                  width: 18,
                  height: 18,
                  padding: 10,
                  top: "10px",
                }}
              >
                <MoreVertIcon
                  sx={{ color: grey[400], width: 18, height: 18 }}
                />
              </IconButton>
            )}
          </ListItem>
        );
      })}
    </List>
  );
};

export default FeaturesList;

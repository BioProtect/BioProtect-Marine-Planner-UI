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

const FeaturesList = (props) => {
  const iconClick = (feature, evt) => {
    props.openFeatureMenu(evt, feature);
  };

  const updateTargetValue = (targetIcon, newValue) => {
    props.updateFeature(targetIcon.props.interestFeature, {
      target_value: newValue,
    });
  };

  const itemClick = (feature, evt) => {
    if (evt.altKey) {
      // Toggle the layers puid visibility
      feature.feature_puid_layer_loaded = !feature.feature_puid_layer_loaded;
      // Add/remove it from the map
      props.toggleFeaturePUIDLayer(feature);
    } else {
      // Toggle the layers visibility
      feature.feature_layer_loaded = !feature.feature_layer_loaded;
      // Add/remove it from the map
      props.toggleFeatureLayer(feature);
    }
  };

  return (
    <List>
      {props.features.map((item) => {
        // Get the total area of the feature in the planning unit
        let pu_area = item.pu_area;

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
            onClick={props.simple ? null : (evt) => itemClick(item, evt)}
            sx={{
              borderRadius: "3px",
              fontSize: "13px",
              color: "rgba(0,0,0,0.8)",
              padding: props.simple ? "5px 5px 5px 5px" : "6px 5px 2px 40px",
            }}
          >
            {!props.simple && (
              <TargetIcon
                sx={{ left: 8 }}
                target_value={item.target_value}
                updateTargetValue={updateTargetValue}
                interestFeature={item}
                targetStatus={targetStatus}
                visible={item.pu_area !== 0}
                userRole={props.userRole}
              />
            )}
            {item.alias}
            {!props.simple && (
              <LinearGauge
                scaledWidth={220}
                target_value={item.target_value}
                protected_percent={protected_percent}
                visible={item.pu_area !== 0}
                color={item.color}
                useFeatureColors={props.useFeatureColors}
                sx={{
                  height: props.smallLinearGauge ? "3px" : "unset",
                }}
                smallLinearGauge={props.smallLinearGauge}
              />
            )}
            {!props.simple && (
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

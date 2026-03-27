import { Fragment, memo } from "react";
import {
  featureApiSlice,
  setSelectedFeatureId,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LinearGauge from "./LinearGauge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TargetAvatar from "./TargetAvatar";
import Tooltip from "@mui/material/Tooltip";
import { grey } from "@mui/material/colors";
import { projectApiSlice } from "@slices/projectSlice";

const FeaturesList = ({
  updateFeature,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  setMenuAnchor,
}) => {
  const dispatch = useDispatch();
  const activeProjectId = useSelector((state) => state.project.activeProjectId);
  // get all features and then filter by selectedIds for project features
  const selectedIds = useSelector((s) => s.feature.selectedFeatureIds);
  const { data: allFeaturesResp } =
    featureApiSlice.endpoints.getAllFeatures.useQuery();
  const allFeatures = allFeaturesResp?.data ?? [];
  const projectFeatures = allFeatures.filter((f) => selectedIds.includes(f.id));

  const handleIconClick = (evt, id) => {
    evt.stopPropagation();
    setMenuAnchor(evt.target);
    dispatch(setSelectedFeatureId(id));
    dispatch(toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: true }));
  };

  const handleItemClick = (evt, feature) => {
    console.log("item cloisked....");
    const key = evt.altKey
      ? "feature_puid_layer_loaded"
      : "feature_layer_loaded";

    // clone + flip whichever flag
    const updated = {
      ...feature,
      [key]: !feature[key],
    };

    // update the map
    evt.altKey ? toggleFeaturePUIDLayer(updated) : toggleFeatureLayer(updated);

    // and sync your Redux slice
    dispatch(
      projectApiSlice.util.updateQueryData(
        "getProject",
        activeProjectId,
        (draft) => {
          if (!draft?.features) return;

          const f = draft.features.find(
            (pf) => (pf.id ?? pf.id) === updated.id,
          );

          if (f) {
            f[key] = updated[key];
          }
        },
      ),
    );
  };

  const handleTargetChange = (feature, newValue) =>
    updateFeature(feature.id, { target_value: newValue });

  return (
    <List sx={{ maxHeight: "60vh", overflowY: "auto", px: 1, mb: 4 }}>
      {projectFeatures.map((item) => {
        const { id, area, protected_area, target_value, color } = item;

        let protectedPercent;
        if (protected_area === -1) {
          protectedPercent = -1;
        } else if (area > 0 && protected_area > 0) {
          protectedPercent = (protected_area / area) * 100;
        } else {
          protectedPercent = 0;
        }

        const isActive =
          item.feature_layer_loaded || item.feature_puid_layer_loaded;

        const content = (
          <ListItem
            key={"feature" + id}
            sx={{
              borderLeft: item.preprocessed
                ? "4px solid #1990FF"
                : "4px solid transparent",
              pl: 1,
              bgcolor: isActive
                ? "rgba(25, 144, 255, 0.18)" // highlight when active
                : item.preprocessed
                  ? "rgba(32, 129, 35, 0.06)" // preprocessed only
                  : "transparent",
              borderRadius: 1,
            }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(evt) => handleIconClick(evt, id)}
                sx={{ ml: 1 }}
              >
                <MoreVertIcon sx={{ color: grey[400] }} />
              </IconButton>
            }
          >
            {/* Goal */}
            <ListItemAvatar>
              <TargetAvatar
                target_value={target_value}
                updateTargetValue={handleTargetChange}
                feature={item}
                targetStatus={
                  area === 0
                    ? "Does not occur in planning area"
                    : protectedPercent === -1
                      ? "Unknown"
                      : protected_area >= item.target_area
                        ? "Target achieved"
                        : "Target missed"
                }
                visible={area !== 0}
              />
            </ListItemAvatar>

            <ListItemText
              onClick={(evt) => handleItemClick(evt, item)}
              primary={item.alias.replaceAll("_", " ")}
              primaryTypographyProps={{ variant: "body2" }}
              sx={{ flex: 1 }}
              secondaryTypographyProps={{ component: "div" }}
              secondary={<LinearGauge value={target_value} />}
            />
          </ListItem>
        );

        return (
          <Fragment key={`feature-${id}`}>
            {item.preprocessed ? (
              <Tooltip title="Preprocessing complete" arrow disableInteractive>
                <Box>{content}</Box>
              </Tooltip>
            ) : (
              content
            )}
          </Fragment>
        );
      })}
    </List>
  );
};

export default memo(FeaturesList);

import { setSelectedFeatureId, toggleFeatureD } from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import IconButton from "@mui/material/IconButton";
import LinearGauge from "./LinearGauge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TargetAvatar from "./TargetAvatar";
import { grey } from "@mui/material/colors";
import { memo } from "react";
import { useGetProjectQuery } from "@slices/projectSlice";

const FeaturesList = ({
  updateFeature,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  setMenuAnchor,
}) => {
  const dispatch = useDispatch();
  const activeProjectId = useSelector((state) => state.project.activeProjectId);
  const { data: projectResp } = useGetProjectQuery(activeProjectId, {
    skip: activeProjectId == null,
  });
  const projectFeatures = projectResp?.features ?? [];

  const handleIconClick = (evt, id) => {
    evt.stopPropagation();
    setMenuAnchor(evt.target);
    dispatch(setSelectedFeatureId(id));
    dispatch(toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: true }));
  };

  const handleItemClick = (evt, feature) => {
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
            (pf) => (pf.id ?? pf.feature_unique_id) === updated.id,
          );

          if (f) {
            f[key] = updated[key];
          }
        },
      ),
    );
  };

  const handleTargetChange = (feature, newValue) =>
    updateFeature(feature, { target_value: newValue });

  return (
    <List sx={{ maxHeight: "60vh", overflowY: "auto", px: 1, mb: 4 }}>
      {projectFeatures.map((item) => {
        const { feature_unique_id, area, protected_area, target_value, color } =
          item;
        let protectedPercent;
        if (protected_area === -1) {
          protectedPercent = -1;
        } else if (area > 0 && protected_area > 0) {
          protectedPercent = (protected_area / area) * 100;
        } else {
          protectedPercent = 0;
        }

        return (
          <ListItem
            key={feature_unique_id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(evt) => handleIconClick(evt, feature_unique_id)}
                sx={{ ml: 1 }}
              >
                <MoreVertIcon sx={{ color: grey[400] }} />
              </IconButton>
            }
          >
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
              primary={item.alias}
              primaryTypographyProps={{ variant: "body2" }}
              sx={{ flex: 1 }}
              secondaryTypographyProps={{ component: "div" }}
              secondary={<LinearGauge value={target_value} />}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default memo(FeaturesList);

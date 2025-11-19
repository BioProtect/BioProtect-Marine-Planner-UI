import {
  setCurrentFeature,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Avatar from '@mui/material/Avatar';
import IconButton from "@mui/material/IconButton";
import LinearGauge from "../LinearGauge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TargetIcon from "../TargetIcon";
import { grey } from "@mui/material/colors";
import { selectCurrentUser } from "@slices/authSlice";
import { setProjectFeatures } from "@slices/projectSlice";

const FeaturesList = ({
  updateFeature,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  useFeatureColors,
  smallLinearGauge,
  setMenuAnchor
}) => {

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

  const handleTargetChange = (feature, newValue) => updateFeature(feature, { target_value: newValue });

  return (
    <List sx={{ maxHeight: "60vh", overflowY: "auto", px: 1, mb: 4 }}  >
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
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(evt) => handleIconClick(evt, item)}
                sx={{ ml: 1 }}
              >
                <MoreVertIcon sx={{ color: grey[400] }} />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar>
                <TargetIcon
                  target_value={target_value}
                  updateTargetValue={handleTargetChange}
                  feature={item}
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
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              onClick={(evt) => handleItemClick(evt, item)}
              primary={item.alias}
              primaryTypographyProps={{ variant: "body2" }}
              sx={{ flex: 1 }}
              secondaryTypographyProps={{ component: "div" }}
              secondary={
                <LinearGauge
                  scaledWidth={220}
                  target_value={target_value}
                  protected_percent={protectedPercent}
                  visible={item.pu_area !== 0}
                  color={color}
                  useFeatureColors={useFeatureColors}
                  sx={{ mt: 0.5, height: smallLinearGauge ? 3 : "auto" }}
                  smallLinearGauge={smallLinearGauge}
                />
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default FeaturesList;

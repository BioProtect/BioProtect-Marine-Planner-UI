import { setSelectedFeatureId, toggleFeatureD } from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import AddToMap from "@mui/icons-material/Visibility";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Preprocess from "@mui/icons-material/Autorenew";
import Properties from "@mui/icons-material/ErrorOutline";
import RemoveFromMap from "@mui/icons-material/VisibilityOff";
import RemoveFromProject from "@mui/icons-material/Remove";
import ZoomIn from "@mui/icons-material/ZoomIn";
import { selectCurrentUser } from "@slices/authSlice";

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
  const selectedFeatureId = useSelector((s) => s.feature.selectedFeatureId);
  const featureDialogs = useSelector((s) => s.feature.dialogs);

  const handleInfoMenuItemClick = () => {
    console.log("item clicked...");
    dispatch(
      toggleFeatureD({ dialogName: "featureInfoDialogOpen", isOpen: true }),
    );
    closeDialog();
  };

  const closeDialog = () =>
    dispatch(toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: false }));
  return (
    <Menu
      open={featureDialogs.featureMenuOpen}
      anchorEl={anchorEl}
      onClose={() => closeDialog()}
      onMouseLeave={closeDialog}
    >
      <MenuItem onClick={() => removeFromProject(selectedFeatureId)}>
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

      <MenuItem onClick={() => toggleFeatureLayer(selectedFeatureId)}>
        <ListItemIcon>
          {selectedFeatureId?.feature_layer_loaded ? (
            <RemoveFromMap />
          ) : (
            <AddToMap />
          )}
        </ListItemIcon>
        {selectedFeatureId?.feature_puid_layer_loaded
          ? "Remove from Map"
          : "Add to Map"}
      </MenuItem>

      <MenuItem onClick={() => toggleFeaturePUIDLayer(selectedFeatureId)}>
        <ListItemIcon>
          {selectedFeatureId?.feature_puid_layer_loaded ? (
            <RemoveFromMap />
          ) : (
            <AddToMap />
          )}
        </ListItemIcon>
        {selectedFeatureId?.feature_puid_layer_loaded
          ? "Remove planning unit outlines"
          : "Outline planning units where the feature occurs"}
      </MenuItem>

      <MenuItem onClick={() => zoomToFeature(selectedFeatureId)}>
        <ListItemIcon>
          <ZoomIn />
        </ListItemIcon>
        Zoom to Feature
      </MenuItem>

      <MenuItem
        onClick={() => preprocessSingleFeature(selectedFeatureId)}
        // {/*disabled={selectedFeatureId?.preprocessed || preprocessing}*/}
      >
        <ListItemIcon>
          <Preprocess />
        </ListItemIcon>
        Preprocess Feature
      </MenuItem>
    </Menu>
  );
};

export default FeatureMenu;

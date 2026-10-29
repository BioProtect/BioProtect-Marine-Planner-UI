import React, { useState } from "react";
import { selectCurrentUser, setCredentials } from "@slices/authSlice";
import {
  featureApiSlice,
  setAddingRemovingFeatures,
  setFeaturePlanningUnits,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Divider from "@mui/material/Divider";
import FeaturesList from "./FeaturesList";
import LayersIcon from "@mui/icons-material/Layers";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import Stack from "@mui/material/Stack";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import Typography from "@mui/material/Typography";
import { toggleDialog } from "@slices/uiSlice";

const FeaturesTab = ({
  preprocessAllFeatures,
  setMenuAnchor,
  simple,
  updateFeature,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  useFeatureColors,
  smallLinearGauge,
  showTargetButton,
  metadata,
}) => {
  const dispatch = useDispatch();
  const userData = useSelector(selectCurrentUser);

  const handleOpenFeaturesDialog = () => {
    dispatch(setAddingRemovingFeatures(true));
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: true,
      }),
    );
  };

  const selectedIds = useSelector((s) => s.feature.selectedFeatureIds);
  const { data: allFeaturesResp } =
    featureApiSlice.endpoints.getAllFeatures.useQuery();
  const projectFeatures = (allFeaturesResp?.data ?? []).filter((f) =>
    selectedIds.includes(f.id),
  );
  const anyLoaded = projectFeatures.some(
    (f) => f.feature_layer_loaded || f.feature_puid_layer_loaded,
  );

  // toggle functions flip whatever is on the map, so only call them on the
  // features that need flipping
  const handleToggleAll = () => {
    projectFeatures.forEach((f) => {
      if (anyLoaded) {
        if (f.feature_layer_loaded) toggleFeatureLayer(f);
        if (f.feature_puid_layer_loaded) toggleFeaturePUIDLayer(f);
      } else {
        toggleFeatureLayer(f);
      }
    });
  };

  const handlePreprocessAllFeatures = () => {
    preprocessAllFeatures();
  };

  const btnSx = {
    fontSize: "0.72rem",
    fontWeight: 600,
    px: 1.25,
    py: 0.5,
    whiteSpace: "nowrap",
    flex: 1,
  };

  return (
    <React.Fragment>
      <div style={{ padding: "4px" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 0.75, mt: 0.5, px: 0.5 }}
        >
          <Stack gap={0.75} sx={{ flex: 1 }}>
            <Stack direction="row" gap={0.75}>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleOpenFeaturesDialog()}
                title="Add/remove features from the project"
                startIcon={<LayersIcon />}
                sx={btnSx}
              >
                Add/Remove Features
              </Button>
            </Stack>
            <Stack direction="row" gap={0.75}>
              <Button
                size="small"
                variant="contained"
                onClick={() => handlePreprocessAllFeatures()}
                title="Preprocess all features"
                startIcon={<SettingsSuggestIcon />}
                sx={btnSx}
              >
                Preprocess
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() =>
                  dispatch(
                    toggleDialog({
                      dialogName: "targetDialogOpen",
                      isOpen: true,
                    }),
                  )
                }
                startIcon={<TrackChangesIcon />}
                sx={btnSx}
              >
                Targets
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleToggleAll}
                disabled={!projectFeatures.length}
                title={
                  anyLoaded
                    ? "Remove all feature layers from the map"
                    : "Show all features on the map"
                }
                startIcon={anyLoaded ? <ClearAllIcon /> : <DoneAllIcon />}
                sx={btnSx}
              >
                {anyLoaded ? "Clear All" : "Show All"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 1, borderColor: "#e0ecec" }} />
        <FeaturesList
          setMenuAnchor={setMenuAnchor}
          updateFeature={updateFeature}
          toggleFeatureLayer={toggleFeatureLayer}
          toggleFeaturePUIDLayer={toggleFeaturePUIDLayer}
          useFeatureColors={useFeatureColors}
          smallLinearGauge={smallLinearGauge}
        />
      </div>
    </React.Fragment>
  );
};

export default FeaturesTab;

import React, { useState } from "react";
import { selectCurrentUser, setCredentials } from "@slices/authSlice";
import {
  setAddingRemovingFeatures,
  setFeaturePlanningUnits,
  setFeatureProjects,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import FeaturesList from "./FeaturesList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Stack from "@mui/material/Stack";
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { faGears } from "@fortawesome/free-solid-svg-icons";
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
  const featureState = useSelector((state) => state.feature);

  const handleOpenFeaturesDialog = () => {
    dispatch(setAddingRemovingFeatures(true));
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: true,
      })
    );
  };

  const handlePreprocessAllFeatures = () => {
    preprocessAllFeatures();
  }

  return (
    <React.Fragment>
      <div style={{ padding: "8px" }} >
        <FeaturesList
          setMenuAnchor={setMenuAnchor}
          updateFeature={updateFeature}
          toggleFeatureLayer={toggleFeatureLayer}
          toggleFeaturePUIDLayer={toggleFeaturePUIDLayer}
          useFeatureColors={useFeatureColors}
          smallLinearGauge={smallLinearGauge}
        />
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          mb={2}
        >
          {userData?.role !== "ReadOnly" && showTargetButton ? (
            <Button
              variant="contained"
              onClick={() => dispatch(
                toggleDialog({
                  dialogName: "targetDialogOpen",
                  isOpen: true,
                })
              )}
              startIcon={<FontAwesomeIcon icon={faCrosshairs} />}
            >
              Set target all features
            </Button>
          ) : null}
          {(metadata && metadata.OLDVERSION) ||
            userData?.role === "ReadOnly" ? null : (
            <Button
              variant="contained"
              label="+/-"
              onClick={() => handleOpenFeaturesDialog()}
              title="Add/remove features from the project"
            >
              +/-
            </Button>
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          {(metadata && metadata.OLDVERSION) ||
            userData?.role === "ReadOnly" ? null : (
            <Button
              variant="contained"
              onClick={() => handlePreprocessAllFeatures()}
              title="preprocess all features"
              startIcon={<FontAwesomeIcon icon={faGears} />}
            >
              Preprocess all features
            </Button>
          )}
        </Stack>
      </div>
    </React.Fragment>
  );
};

export default FeaturesTab;

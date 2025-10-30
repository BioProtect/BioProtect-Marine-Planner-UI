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

const FeaturesTab = (props) => {
  const dispatch = useDispatch();
  console.log("features tab useSelector(selectCurrentUser) ", useSelector(selectCurrentUser));

  const userData = useSelector(selectCurrentUser);
  console.log("userData ", userData);
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
    props.preprocessAllFeatures();
  }

  return (
    <React.Fragment>
      <div style={{ padding: "8px" }} >
        <FeaturesList
          setMenuAnchor={props.setMenuAnchor}
          simple={props.simple}
          updateFeature={props.updateFeature}
          toggleFeatureLayer={props.toggleFeatureLayer}
          toggleFeaturePUIDLayer={props.toggleFeaturePUIDLayer}
          useFeatureColors={props.useFeatureColors}
          smallLinearGauge={props.smallLinearGauge}
        />
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          mb={2}
        >
          {userData?.role !== "ReadOnly" && props.showTargetButton ? (
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
          {(props.metadata && props.metadata.OLDVERSION) ||
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
          {(props.metadata && props.metadata.OLDVERSION) ||
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

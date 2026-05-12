import React, { useState } from "react";
import { selectCurrentUser, setCredentials } from "@slices/authSlice";
import {
  setAddingRemovingFeatures,
  setFeaturePlanningUnits,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FeaturesList from "./FeaturesList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

  const handleOpenFeaturesDialog = () => {
    dispatch(setAddingRemovingFeatures(true));
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: true,
      }),
    );
  };

  const handlePreprocessAllFeatures = () => {
    preprocessAllFeatures();
  };

  return (
    <React.Fragment>
      <div style={{ padding: "8px" }}>
        <FeaturesList
          setMenuAnchor={setMenuAnchor}
          updateFeature={updateFeature}
          toggleFeatureLayer={toggleFeatureLayer}
          toggleFeaturePUIDLayer={toggleFeaturePUIDLayer}
          useFeatureColors={useFeatureColors}
          smallLinearGauge={smallLinearGauge}
        />
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Typography variant="h6" color="textSecondary" mt={1}>
            Features
          </Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          mb={2}
        >
          <ButtonGroup variant="text" aria-label="Basic button group">
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
              startIcon={<FontAwesomeIcon icon={faCrosshairs} />}
            >
              Update
            </Button>
            <Button
              size="small"
              variant="contained"
              label="+/-"
              onClick={() => handleOpenFeaturesDialog()}
              title="Add/remove features from the project"
            >
              +/- Add/Remove
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handlePreprocessAllFeatures()}
              title="preprocess all features"
              startIcon={<FontAwesomeIcon icon={faGears} />}
            >
              Preprocess
            </Button>
          </ButtonGroup>
        </Stack>
      </div>
    </React.Fragment>
  );
};

export default FeaturesTab;

import React, { useState } from "react";
import { selectCurrentUser, setCredentials } from "../slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import FeaturesList from "./FeaturesList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Stack from "@mui/material/Stack";
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { toggleDialog } from "../slices/uiSlice";

const FeaturesTab = (props) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const userData = useSelector(selectCurrentUser);


  const openFeaturesDialog = (evt) => {
    props.openFeaturesDialog(true);
  };

  return (
    <React.Fragment>
      <div className="newPUDialogPane">
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
        >
          {userData.role !== "ReadOnly" && props.showTargetButton ? (
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
              Set a target for all features
            </Button>
          ) : null}
          {(props.metadata && props.metadata.OLDVERSION) ||
            userData.role === "ReadOnly" ? null : (
            <Button
              variant="contained"
              label="+/-"
              onClick={openFeaturesDialog}
              title="Add/remove features from the project"
            >
              +/-
            </Button>
          )}
        </Stack>
      </div>
    </React.Fragment>
  );
};

export default FeaturesTab;

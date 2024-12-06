import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import FeaturesList from "./LeftInfoPanel/FeaturesList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Stack from "@mui/material/Stack";
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { toggleDialog } from "./slices/uiSlice";

const SelectFeatures = (props) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);

  const openFeaturesDialog = (evt) => {
    props.openFeaturesDialog(true);
  };

  return (
    <React.Fragment>
      <div className="newPUDialogPane">
        <FeaturesList
          {...props}
          features={props.features}
          openFeatureMenu={props.openFeatureMenu}
          simple={props.simple}
          updateFeature={props.updateFeature}
          userRole={props.userRole}
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
          {props.userRole !== "ReadOnly" && props.showTargetButton ? (
            <Button
              variant="contained"
              onClick={dispatch(
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
          props.userRole === "ReadOnly" ? null : (
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

export default SelectFeatures;

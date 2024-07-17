import Button from "@mui/material/Button";
import FeaturesList from "./LeftInfoPanel/FeaturesList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Stack from "@mui/material/Stack";
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons";

const SelectFeatures = (props) => {
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
          <Button
            variant="contained"
            onClick={props.openTargetDialog}
            show={props.userRole !== "ReadOnly" && props.showTargetButton}
            startIcon={<FontAwesomeIcon icon={faCrosshairs} />}
          >
            Set a target for all features
          </Button>
          <Button
            variant="contained"
            labelStyle={{ paddingLeft: "6px", paddingRight: "6px" }}
            label="+/-"
            onClick={openFeaturesDialog}
            show={
              !(
                (props.metadata && props.metadata.OLDVERSION) ||
                props.userRole === "ReadOnly"
              )
            }
            title="Add/remove features from the project"
          >
            +/-
          </Button>
        </Stack>
      </div>
    </React.Fragment>
  );
};

export default SelectFeatures;

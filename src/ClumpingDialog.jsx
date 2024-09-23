import React, { useEffect, useState } from "react";

import CONSTANTS from "./constants";
import MapContainer from "./MapContainer";
import MarxanDialog from "./MarxanDialog";
import MarxanTextField from "./MarxanTextField";
import ToolbarButton from "./ToolbarButton";

const CLUMP_COUNT = 5;

const ClumpingDialog = (props) => {
  const [blmValues, setBlmValues] = useState([0.001, 0.01, 0.1, 1, 10]);
  const [blmMin, setBlmMin] = useState(0.001);
  const [blmMax, setBlmMax] = useState(10);
  const [blmChanged, setBlmChanged] = useState(false);

  useEffect(() => {
    if (props.open) {
      props.createProjectGroupAndRun(blmValues);
    }
  }, [props.open, props.createProjectGroupAndRun, blmValues]);

  const getBlmValues = (min, max) => {
    // Get 5 blm values based on the min and max
    const increment = (max - min) / (CLUMP_COUNT - 1);
    const values = Array.from(
      { length: CLUMP_COUNT },
      (_, i) => i * increment + Number(min)
    );
    setBlmValues(values);
    setBlmChanged(true);
  };

  const changeBlmMin = (event) => {
    const newValue = event.target.value;
    getBlmValues(newValue, blmMax);
    setBlmMin(newValue);
  };

  const changeBlmMax = (event) => {
    const newValue = event.target.value;
    getBlmValues(blmMin, newValue);
    setBlmMax(newValue);
  };

  const parseBlmValue = (value) =>
    !isNaN(parseFloat(value)) && isFinite(value) ? value : "";

  const selectBlm = (blmValue) => {
    props.setBlmValue(blmValue);
    props.onOk();
  };

  const rerun = () => {
    props.rerunProjects(blmChanged, blmValues);
    setBlmChanged(false);
  };

  const onClose = () => {
    if (!props.clumpingRunning) props.onOk();
  };

  return (
    <MarxanDialog
      open={props.open}
      onCancel={props.onCancel}
      showSpinner={props.clumpingRunning}
      onOk={onClose}
      okDisabled={props.clumpingRunning}
      showCancelButton={true}
      helpLink={"user.html#clumping-window"}
      actions={[
        <ToolbarButton
          label="Refresh"
          primary={true}
          onClick={rerun}
          disabled={props.clumpingRunning || !blmChanged}
        />,
      ]}
      title="Clumping"
    >
      <div key="k7">
        {[0, 1, 2, 3, 4].map((i) => (
          <MapContainer
            key={i}
            disabled={props.clumpingRunning}
            selectBlm={selectBlm}
            tileset={props.tileset}
            RESULTS_LAYER_NAME={CONSTANTS.RESULTS_LAYER_NAME}
            paintProperty={props[`map${i}_paintProperty`]}
            blmValue={parseBlmValue(blmValues[i])}
            mapCentre={props.mapCentre}
            mapZoom={props.mapZoom}
          />
        ))}
        <div
          style={{
            display: "inline-block",
            margin: "5px",
            verticalAlign: "top",
            paddingTop: "60px",
            textAlign: "center",
            fontSize: "14px",
            width: "200px",
            height: "224px",
          }}
        >
          <div>Move and zoom the main map to preview the clumping</div>
          <div style={{ paddingTop: "30px" }}>
            <span>BLM from </span>
            <MarxanTextField
              value={blmMin}
              onChange={changeBlmMin}
              style={{ width: "36px" }}
              inputStyle={{ textAlign: "center", fontSize: "14px" }}
              id="blmmin"
              disabled={props.clumpingRunning}
            />
            <span> to </span>
            <MarxanTextField
              value={blmMax}
              onChange={changeBlmMax}
              style={{ width: "36px" }}
              inputStyle={{ textAlign: "center", fontSize: "14px" }}
              id="blmmax"
              disabled={props.clumpingRunning}
            />
          </div>
        </div>
      </div>
    </MarxanDialog>
  );
};

export default ClumpingDialog;

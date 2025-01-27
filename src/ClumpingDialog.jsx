import React, { useEffect, useState } from "react";
import {
  setActiveResultsTab,
  setActiveTab,
  setSnackbarMessage,
  setSnackbarOpen,
  toggleDialog,
  togglePlanningGridDialog,
  toggleProjectDialog,
} from "./slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import CONSTANTS from "./constants";
import MapContainer from "./MapContainer";
import MarxanDialog from "./MarxanDialog";
import MarxanTextField from "./MarxanTextField";
import ToolbarButton from "./ToolbarButton";
import { toggleFeatureD } from "./slices/featureSlice";

const CLUMP_COUNT = 5;

const ClumpingDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );
  const planningGridDialogStates = useSelector(
    (state) => state.ui.planningGridDialogStates
  );
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
    setBlmValue(blmValue);
    props.onOk();
  };

  // Load a solution from another project - used in the clumping dialog - when the solution is loaded the paint properties are set on the individual maps through state changes
  const loadOtherSolution = async (user, proj, solution) => {
    const response = await getSolution(user, proj, solution);
    const paintProperties = getPaintProperties(response.solution, false, false);
    // Get the proj that matches the proj name from the this.projs property - this was set when the projGroup was created
    if (projState.projects) {
      const _projects = projState.projects.filter((item) => item.projectName === proj);
      // Get which clump it is
      const { clump } = _projects[0];
      setMapPaintProperties({ [`mapPP${clump}`]: paintProperties });
    }
  };

  const runProjects = async (projects) => {
    //reset the counter
    let projectsRun = 0;
    setClumpingRunning(true);
    // Iterate through projects using a for...of loop to handle async/await correctly
    try {
      for (const proj of projects) {
        // Start the Marxan job and wait for the response
        const response = await props.startMarxanJob(
          "_clumping",
          proj.projectName,
          false
        );

        // Check for errors and proceed if no errors are found
        if (!this.checkForErrors(response, false)) {
          await loadOtherSolution(response.user, response.project, 1);
        }
        projectsRun += 1;
        if (projectsRun === 5) {
          setClumpingRunning(false);
        }
      }
    } catch (error) {
      // Handle errors if any occur during the process
      console.error("An error occurred while running projects:", error);
    }
  };

  const setBlmValue = async (blmValue) => {
    const newRunParams = runParams.map((item) => ({
      key: item.key,
      value: item.key === "BLM" ? String(blmValue) : item.value,
    }));

    // Update the run parameters
    return await updateRunParams(newRunParams);
  };

  //creates a group of 5 projects with UUIDs in the _clumping folder
  const createProjectGroupAndRun = async (blmValues) => {
    // OLD
    // const response = await _get(
    //   `createProjectGroup?user=${owner}&project=${project}&copies=5&blmValues=${blmValues.join(
    //     ","
    //   )}`
    // );
    // Define the request payload
    const payload = {
      user: owner,
      project: project,
      copies: 5,
      blmValues: blmValues.join(","),
    };

    // Make a POST request to create the project group
    const response = await _post("projects?action=create_group", payload);
    // Run the created projects
    await runProjects(response.data);
    return "Project group created";
  };

  const rerunProjects = async (blmChanged, blmValues) => {
    //reset the paint properties in the clumping dialog
    resetPaintProperties();
    //if the blmValues have changed then recreate the project group and run
    if (blmChanged) {
      await createProjectGroupAndRun(blmValues);
    } else {
      //rerun the projects
      await runProjects(this.projects);
    }
  };

  const rerun = () => {
    rerunProjects(blmChanged, blmValues);
    setBlmChanged(false);
  };


  const closeDialog = () => {
    if (!props.clumpingRunning) {
      props.hideClumpingDialog();
    }
  };

  return (
    <MarxanDialog
      open={dialogStates.clumpingDialogOpen}
      onCancel={props.hideClumpingDialog}
      showSpinner={props.clumpingRunning}
      onOk={closeDialog}
      okDisabled={props.clumpingRunning}
      showCancelButton={true}
      helpLink={"user.html#clumping-window"}
      actions={[
        <ToolbarButton
          key="cd1"
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
            paintProperty={props.mapPaintProperties[`mapPP${i}`]}
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

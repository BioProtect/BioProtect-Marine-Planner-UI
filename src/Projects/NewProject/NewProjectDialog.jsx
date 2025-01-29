import React, { useEffect, useState } from "react";
import { setAllFeatures, toggleFeatureD } from "../../slices/featureSlice.js";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import FeaturesDialog from "../../Features/FeaturesDialog";
import MarxanDialog from "../../MarxanDialog";
import Metadata from "../../Metadata";
import PlanningUnitsDialog from "../../PlanningGrids/PlanningUnitsDialog";
import SelectCostFeatures from "../../SelectCostFeatures";
import SelectFeatures from "../../LeftInfoPanel/FeaturesTab.jsx";
import { setSelectedFeatureIds } from "../../slices/featureSlice.js"
import {
  toggleProjectDialog,
} from "../../slices/uiSlice";

const NewProjectDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature)
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );

  const [steps] = useState(["Info", "Planning units", "Features"]);
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pu, setPU] = useState("");

  useEffect(() => {
    dispatch(setAllFeatures(JSON.parse(JSON.stringify(uiState.allFeatures || []))));
  }, [uiState.allFeatures]);

  const handleNext = () => setStepIndex((prev) => prev + 1);
  const handlePrev = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const updateSelectedFeatures = () => {
    const updatedFeatures = uiState.allFeatures.map((feature) => ({
      ...feature,
      selected: featureState.selectedFeatureIds.includes(feature.id),
    }));
    dispatch(setAllFeatures(updatedFeatures));
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false })
    );
  };

  const clickFeature = (feature) => {
    if (featureState.selectedFeatureIds.includes(feature.id)) {
      removeFeature(feature);
    } else {
      addFeature(feature);
    }
  };

  const addFeature = (feature) =>
    dispatch(setSelectedFeatureIds((prevIds) => [...prevIds, feature.id]));

  const removeFeature = (feature) =>
    setSelectedFeatureIds((prevIds) =>
      prevIds.filter((id) => id !== feature.id)
    );

  const selectAllFeatures = () =>
    dispatch(setSelectedFeatureIds(uiState.allFeatures.map((feature) => feature.id)));
  const clearAllFeatures = () => dispatch(setSelectedFeatureIds([]));

  const createNewProject = () => {
    props.createNewProject({
      name,
      description,
      planning_grid_name: pu,
      features: uiState.allFeatures.filter((item) => item.selected),
    });
    closeDialog();
  };

  const closeDialog = () => {
    setStepIndex(0);
    dispatch(
      toggleProjectDialog({ dialogName: "newProjectDialogOpen", isOpen: false })
    );
  };

  const actions = (
    <div>
      <Button
        variant="outlined"
        disabled={stepIndex === 0}
        onClick={handlePrev}
      >
        Back
      </Button>
      <Button
        variant="outlined"
        onClick={stepIndex === steps.length - 1 ? createNewProject : handleNext}
        disabled={
          (stepIndex === 0 && (name === "" || description === "")) ||
          (stepIndex === 1 && pu === "") ||
          (stepIndex === 2 && featureState.selectedFeatureIds.length === 0)
        }
      >
        {stepIndex === steps.length - 1 ? "Finish" : "Next"}
      </Button>
    </div>
  );

  return (
    <>
      <MarxanDialog
        open={projectDialogStates.newProjectDialogOpen}
        loading={props.loading}
        title="New project"
        fullWidth={true}
        actions={actions}
        okLabel="Cancel"
        onOk={() => closeDialog()}
        onCancel={() => closeDialog()}
        onClose={() => closeDialog()}
        helpLink="user.html#creating-new-projects"
      >
        <div key="k3">
          {stepIndex === 0 && (
            <Metadata
              name={name}
              description={description}
              setName={setName}
              setDescription={setDescription}
            />
          )}

          {stepIndex === 1 && (
            <PlanningUnitsDialog
              previewFeature={previewFeature}
              getPlanningUnitGrids={props.getPlanningUnitGrids}
              changeItem={setPU}
              pu={pu}
              openImportPlanningGridDialog={props.openImportPlanningGridDialog}
            />
          )}
          {stepIndex === 2 && (
            <div style={{ height: "390px" }}>
              <div className="tabTitle">Select the features</div>
              <SelectFeatures
                features={uiState.allFeatures.filter((item) => item.selected)}
                openFeaturesDialog={() =>
                  dispatch(
                    toggleFeatureD({
                      dialogName: "featuresDialogOpen",
                      isOpen: true,
                    })
                  )
                }
                simple={true}
                showTargetButton={false}
                leftmargin="0px"
                maxheight="356px"
              />
            </div>
          )}
          {stepIndex === 3 && (
            <SelectCostFeatures selectedCosts={props.selectedCosts} />
          )}
        </div>
      </MarxanDialog>
      <FeaturesDialog
        open={featureDialogStates.featuresDialogOpen}
        onOk={updateSelectedFeatures}
        onCancel={() =>
          dispatch(
            toggleFeatureD({
              dialogName: "featuresDialogOpen",
              isOpen: false,
            })
          )
        }
        loadingFeatures={false} // Update this according to your loading state
        selectAllFeatures={selectAllFeatures}
        clearAllFeatures={clearAllFeatures}
        clickFeature={clickFeature}
        metadata={{ OLDVERSION: false }}
        userRole="User"
        previewFeature={props.previewFeature}
      />
    </>
  );
};

export default NewProjectDialog;

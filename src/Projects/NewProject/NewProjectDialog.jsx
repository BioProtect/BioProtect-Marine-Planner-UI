import React, { useEffect, useState } from "react";
import {
  toggleFeatureDialog,
  toggleProjectDialog,
} from "../../slices/uiSlice.js";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import FeaturesDialog from "../../Features/FeaturesDialog";
import MarxanDialog from "../../MarxanDialog";
import Metadata from "../../Metadata";
import PlanningUnitsDialog from "../../PlanningGrids/PlanningUnitsDialog";
import SelectCostFeatures from "../../SelectCostFeatures";
import SelectFeatures from "../../SelectFeatures";

const NewProjectDialog = (props) => {
  const dispatch = useDispatch();
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
  const [allFeatures, setAllFeatures] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);

  useEffect(() => {
    setAllFeatures(JSON.parse(JSON.stringify(props.features || [])));
  }, [props.features]);

  const handleNext = () => setStepIndex((prev) => prev + 1);
  const handlePrev = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const updateSelectedFeatures = () => {
    const updatedFeatures = allFeatures.map((feature) => ({
      ...feature,
      selected: selectedFeatureIds.includes(feature.id),
    }));
    setAllFeatures(updatedFeatures);
    dispatch(
      toggleFeatureDialog({ dialogName: "featuresDialogOpen", isOpen: false })
    );
  };

  const clickFeature = (feature) => {
    if (selectedFeatureIds.includes(feature.id)) {
      removeFeature(feature);
    } else {
      addFeature(feature);
    }
  };

  const addFeature = (feature) =>
    setSelectedFeatureIds((prevIds) => [...prevIds, feature.id]);
  const removeFeature = (feature) =>
    setSelectedFeatureIds((prevIds) =>
      prevIds.filter((id) => id !== feature.id)
    );

  const selectAllFeatures = () =>
    setSelectedFeatureIds(allFeatures.map((feature) => feature.id));
  const clearAllFeatures = () => setSelectedFeatureIds([]);

  const createNewProject = () => {
    props.createNewProject({
      name,
      description,
      planning_grid_name: pu,
      features: allFeatures.filter((item) => item.selected),
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
          (stepIndex === 2 && selectedFeatureIds.length === 0)
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
              planning_unit_grids={props.planning_unit_grids}
              changeItem={setPU}
              pu={pu}
              openImportPlanningGridDialog={props.openImportPlanningGridDialog}
            />
          )}
          {stepIndex === 2 && (
            <div style={{ height: "390px" }}>
              <div className="tabTitle">Select the features</div>
              <SelectFeatures
                features={allFeatures.filter((item) => item.selected)}
                openFeaturesDialog={() =>
                  dispatch(
                    toggleFeatureDialog({
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
            toggleFeatureDialog({
              dialogName: "featuresDialogOpen",
              isOpen: false,
            })
          )
        }
        loadingFeatures={false} // Update this according to your loading state
        allFeatures={allFeatures}
        selectAllFeatures={selectAllFeatures}
        clearAllFeatures={clearAllFeatures}
        selectFeatures={setSelectedFeatureIds}
        clickFeature={clickFeature}
        addingRemovingFeatures
        selectedFeatureIds={selectedFeatureIds}
        metadata={{ OLDVERSION: false }}
        userRole="User"
        previewFeature={props.previewFeature}
      />
    </>
  );
};

export default NewProjectDialog;

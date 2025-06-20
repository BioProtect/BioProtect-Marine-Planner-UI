import React, { useEffect, useState } from "react";
import { setAllFeatures, toggleFeatureD } from "@slices/featureSlice.js";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import FeaturesDialog from "@features/FeaturesDialog";
import MarxanDialog from "../../MarxanDialog";
import Metadata from "../../Metadata";
import PlanningUnitsDialog from "@planningGrids/PlanningUnitsDialog";
import SelectCostFeatures from "../../SelectCostFeatures";
import SelectFeatures from "../../LeftInfoPanel/FeaturesTab.jsx";
import { setSelectedFeatureIds } from "@slices/featureSlice.js"
import { togglePUD } from "@slices/planningUnitSlice.js";
import { toggleProjDialog } from "@slices/projectSlice.js";

const NewProjectDialog = ({
  loading,
  openFeaturesDialog,
  selectedCosts,
  createNewProject,
  previewFeature,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature)
  const projState = useSelector((state) => state.project);
  const planningState = useSelector((state) => state.planningUnit);

  const [steps] = useState(["Info", "Planning units", "Features"]);
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pu, setPU] = useState("");
  const [puMap, setPuMap] = useState(null);


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

  const handleCreateNewProject = () => {
    createNewProject({
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
      toggleProjDialog({ dialogName: "newProjectDialogOpen", isOpen: false })
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
        onClick={stepIndex === steps.length - 1 ? handleCreateNewProject : handleNext}
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
        open={projState.dialogs.newProjectDialogOpen}
        loading={loading}
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
              changeItem={setPU}
              pu={pu}
              openImportPlanningGridDialog={planningState.dialogs.importPlanningGridDialogOpen}
              puMap={puMap}
              setPuMap={setPuMap}
            />
          )}
          {stepIndex === 2 && (
            <div style={{ height: "390px" }}>
              <div className="tabTitle">Select the features</div>
              <SelectFeatures
                features={featureState.allFeatures.filter((item) => item.selected)}
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
            <SelectCostFeatures selectedCosts={selectedCosts} />
          )}
        </div>
      </MarxanDialog>
      <FeaturesDialog
        open={featureState.dialogs.featuresDialogOpen}
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
        previewFeature={previewFeature}
      />
    </>
  );
};

export default NewProjectDialog;

import React, { useEffect, useState } from "react";

import FeaturesDialog from "./Features/FeaturesDialog";
import MarxanDialog from "./MarxanDialog";
import Metadata from "./Metadata";
import PlanningUnitsDialog from "./PlanningGrids/PlanningUnitsDialog";
import SelectCostFeatures from "./SelectCostFeatures";
import SelectFeatures from "./SelectFeatures";
import ToolbarButton from "./ToolbarButton";

const NewProjectDialog = (props) => {
  const [steps] = useState(["Info", "Planning units", "Features"]);
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pu, setPU] = useState("");
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  const [allFeatures, setAllFeatures] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);

  useEffect(() => {
    setAllFeatures(JSON.parse(JSON.stringify(props.features || [])));
  }, [props.features]);

  const handleNext = () => setStepIndex((prev) => prev + 1);

  const handlePrev = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const openFeaturesDialog = () => {
    setFeaturesDialogOpen(true);
  };

  const closeFeaturesDialog = () => {
    setFeaturesDialogOpen(false);
  };

  const updateSelectedFeatures = () => {
    const updatedFeatures = allFeatures.map((feature) => ({
      ...feature,
      selected: selectedFeatureIds.includes(feature.id),
    }));
    setAllFeatures(updatedFeatures);
    closeFeaturesDialog();
  };

  const clickFeature = (feature) => {
    setSelectedFeatureIds((prevIds) =>
      prevIds.includes(feature.id)
        ? prevIds.filter((id) => id !== feature.id)
        : [...prevIds, feature.id]
    );
  };

  const createNewProject = () => {
    props.createNewProject({
      name,
      description,
      planning_grid_name: pu,
      features: allFeatures.filter((item) => item.selected),
    });
    onOk();
  };

  const onOk = () => {
    setStepIndex(0);
    props.updateState({ newProjectDialogOpen: false });
  };

  const contentStyle = { margin: "0 16px" };
  const actions = (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "auto",
        textAlign: "center",
      }}
    >
      <div style={contentStyle}>
        <div style={{ marginTop: 12 }}>
          <ToolbarButton
            label="Back"
            disabled={stepIndex === 0}
            onClick={handlePrev}
          />
          <ToolbarButton
            label={stepIndex === steps.length - 1 ? "Finish" : "Next"}
            onClick={
              stepIndex === steps.length - 1 ? createNewProject : handleNext
            }
            primary
            disabled={
              (stepIndex === 0 && (name === "" || description === "")) ||
              (stepIndex === 1 && pu === "") ||
              (stepIndex === 2 && selectedFeatureIds.length === 0)
            }
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MarxanDialog
        {...props}
        title="New project"
        contentWidth={400}
        actions={actions}
        okLabel="Cancel"
        onOk={onOk}
        onCancel={onOk}
        onClose={onOk}
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
              {...props}
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
                openFeaturesDialog={openFeaturesDialog}
                simple
                showTargetButton={false}
                leftmargin="0px"
                maxheight="356px"
              />
            </div>
          )}
          {stepIndex === 3 && (
            <SelectCostFeatures
              openCostsDialog={() =>
                props.updateState({ costsDialogOpen: true })
              }
              selectedCosts={props.selectedCosts}
            />
          )}
        </div>
      </MarxanDialog>
      <FeaturesDialog
        open={featuresDialogOpen}
        onOk={updateSelectedFeatures}
        onCancel={closeFeaturesDialog}
        loadingFeatures={false} // Update this according to your loading state
        allFeatures={allFeatures}
        selectAllFeatures={() =>
          setSelectedFeatureIds(allFeatures.map((feature) => feature.id))
        }
        clearAllFeatures={() => setSelectedFeatureIds([])}
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

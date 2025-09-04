import { MenuItem, Select, Typography } from "@mui/material";
import { setAllFeatures, setSelectedFeatureIds, toggleFeatureD } from "@slices/featureSlice.js";
import { setPlanningUnitGrids, useListPlanningUnitGridsQuery } from "@slices/planningUnitSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FeaturesDialog from "@features/FeaturesDialog";
import FileUpload from "../Uploads/FileUpload";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from '@mui/material/FormControlLabel';
import MarxanDialog from "../MarxanDialog.jsx";
import PlanningUnitsDialog from "@planningGrids/PlanningUnitsDialog";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import SelectCostFeatures from "../SelectCostFeatures.jsx";
import SelectFeatures from "../LeftInfoPanel/FeaturesTab.jsx";
import TextField from "@mui/material/TextField";
import { toggleProjDialog } from "@slices/projectSlice.js";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { usePlanningGridWebSocket } from "@hooks/usePlanningGridWebSocket";

const NewProjectDialog = ({ loading, openFeaturesDialog, selectedCosts, previewFeature, fileUpload }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature)
  const projState = useSelector((state) => state.project);
  const puState = useSelector((state) => state.planningUnit);

  // 0: Info, 1: Planning units (upload/select), 2: Features, 3: Costs
  const [steps] = useState(["Info", "Planning units", "Features", "Costs"]);
  const [stepIndex, setStepIndex] = useState(0);

  // project basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // planning grid choice
  const [puGrid, setPuGrid] = useState(""); // 'upload' | 'select'
  const [puMap, setPuMap] = useState(null);
  const [pu, setPu] = useState(""); // tileset id / selected grid id

  // upload → create grid inputs
  const [filename, setFilename] = useState("")
  const [planningGridName, setPlanningGridName] = useState("");
  const [resolution, setResolution] = useState(7);
  const resolutionOptions = [
    { label: "Basin resolution (36 km²)", value: 6 },
    { label: "Regional resolution (5 km²)", value: 7 },
    { label: "Local resolution (0.7 km²)", value: 8 }
  ]

  // upload progress → continue automatically
  const [waitingForUpload, setWaitingForUpload] = useState(false);

  const { createPlanningGridViaWebSocket } = usePlanningGridWebSocket();
  const { showMessage } = useAppSnackbar();
  const { refetch: refetchPlanningUnitGrids } = useListPlanningUnitGridsQuery();


  useEffect(() => {
    dispatch(setAllFeatures(JSON.parse(JSON.stringify(uiState.allFeatures || []))));
  }, [uiState.allFeatures]);

  useEffect(() => {
    if (uiState.fileUploadResponse?.file) {
      setPlanningGridName(uiState.fileUploadResponse.file.replaceAll("_", " ").split(".")[0]);
    }
  }, [uiState.fileUploadResponse]);

  useEffect(() => {
    if (waitingForUpload) {
      setWaitingForUpload(false);
      setStepIndex(2);
    }
  }, [waitingForUpload]);


  const createNewProject = async (proj) => {
    const formData = prepareFormDataNewProject(proj, user);
    // formData should be in the following format
    // {
    //     "user": "username",
    //     "project": "project_name",
    //     "description": "Project description",
    //     "planning_grid_name": "grid_name",
    //     "interest_features": "feature1,feature2",
    //     "target_values": "value1,value2",
    //     "spf_values": "spf1,spf2"
    // }
    // const response = await _post("createProject", formData); - old
    const response = await _post("projects?action=create", formData);
    showMessage(response.info, "success");
    dispatch(toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false }));
    await loadProject(response.name, response.user);
  };

  //creates a new planning grid unit
  const createPlanningUnitGrid = () => {
    createPlanningGridViaWebSocket({
      shapefile_path: filename,
      alias: planningGridName,
      description: `Grid created from uploaded shapefile`,
      resolution: resolution,
    }, {
      onUpdate: (msg) => {
        showMessage(msg)
        console.log(msg);
      },
      onSuccess: async (result) => {
        console.log("result ", result);
        if (result?.status === "error" || result?.error) {
          showMessage(result?.error || "Failed to create planning grid", "error");
          return;
        }

        showMessage(result?.info || "Planning grid created");

        const updated = await refetchPlanningUnitGrids();
        const grids = updated?.data?.planning_unit_grids || [];


        if (grids.length > 0) {
          dispatch(setPlanningUnitGrids(grids));
          const newGrid = grids.find(
            (g) => g.alias === `${planningGridName} (Res ${resolution})`
          );

          if (newGrid?.tilesetid) {
            setPu(newGrid.tilesetid);
            changeItem(newGrid.tilesetid);
            console.log("Planning grid uploaded");
            showMessage("Planning grid uploaded", "success")
            setWaitingForUpload(true);

            return
          }
        }

        showMessage("Grid creation did not complete or was not found.", "error");
      },
      onError: (errMsg) => {
        showMessage(`❌ ${errMsg}`, "error");
      },
    });
  };

  // ----------------------------------------------------------------

  // navigation
  const handleNext = () => {
    if (stepIndex === 0) {
      // choose path (upload vs select) on the next step
      setStepIndex(1);
      return;
    }
    setStepIndex((prev) => prev + 1);
  };
  const handlePrev = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  // form handlers
  const handleChangeName = (e) => setName(e.target.value);
  const handleChangeDescription = (e) => setDescription(e.target.value);
  const handleRadioChange = (e) => setPuGrid(e.target.value);

  const handleCreateNewPlanningGrid = async () => {
    console.log("filename,resolution: ", uiState.fileUploadResponse, resolution);
    setFilename(`imports / ${uiState.fileUploadResponse?.file} `);
    try {
      console.log("creating planning unit grid.....")
      console.log("with params.. ", filename, ", ", planningGridName, ", ", resolution)
      await createPlanningUnitGrid(
        filename,
        planningGridName,
        resolution
      );
    } catch (error) {
      console.error("Error creating planning grid:", error);
    }
  };


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
    dispatch(setSelectedFeatureIds((prevIds) => prevIds.filter((id) => id !== feature.id)));

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
          (stepIndex === 0 && (name === "" || description === "" || puGrid === "")) ||
          (stepIndex === 1 && puState.currentPUGrid === "") ||
          (stepIndex === 2 && featureState.selectedFeatureIds.length === 0)
        }
      >
        {stepIndex === steps.length - 1 ? "Finish" : "Next"}
      </Button>
    </div >
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
        {/* STEP 0 — Info + Grid choice */}
        {stepIndex === 0 && (
          <FormControl fullWidth component="fieldset" sx={{ gap: 2 }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                required
                id="projectname"
                label="Project Name"
                name="projectname"
                margin="normal"
                autoFocus
                value={name}
                onChange={handleChangeName}
              />
              <TextField
                fullWidth
                minRows={3}
                id="projectdescription"
                name="projectdescription"
                label="Project Description"
                margin="normal"
                value={description}
                onChange={handleChangeDescription}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Planning Grid Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a shapefile to create a new planning grid or select one that already exists.
              </Typography>
              <RadioGroup name="pu-grid-options" value={puGrid} onChange={handleRadioChange}>
                <FormControlLabel value="upload" control={<Radio />} label="Upload a shapefile" />
                <FormControlLabel value="select" control={<Radio />} label="Select from existing planning grids" />
              </RadioGroup>
            </Box>
          </FormControl>
        )}

        {/* STEP 1 — Upload OR Select existing */}
        {stepIndex === 1 && puGrid === "upload" && (
          <Box display="flex" flexDirection="column" gap={2}>
            <FileUpload
              loading={uiState.loading}
              fileUpload={fileUpload}
              fileMatch=".zip"
              mandatory
              destFolder="data/tmp/"
              label="Shapefile (.zip)"
            />
            <TextField
              label="Planning grid name"
              fullWidth
              value={planningGridName}
              onChange={(e) => setPlanningGridName(e.target.value)}
            />
            <Box>
              <Typography variant="body2" gutterBottom>
                Resolution of planning grid
              </Typography>
              <Select value={resolution} onChange={(e) => setResolution(e.target.value)} sx={{ width: 500 }}>
                {resolutionOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button variant="outlined" onClick={handleCreateNewPlanningGrid} disabled={!uiState.fileUploadResponse?.file || !planningGridName}>
              Create planning grid
            </Button>
          </Box>
        )}

        {stepIndex === 1 && puGrid === "select" && (
          <PlanningUnitsDialog previewFeature={previewFeature} puMap={puMap} setPuMap={setPuMap} />
        )}

        {/* STEP 2 — Features */}
        {stepIndex === 2 && (
          <div style={{ height: "390px" }}>
            <div className="tabTitle">Select the features</div>
            <SelectFeatures
              features={featureState.allFeatures.filter((item) => item.selected)}
              openFeaturesDialog={() =>
                dispatch(toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: true }))
              }
              simple
              showTargetButton={false}
              leftmargin="0px"
              maxheight="356px"
            />
          </div>
        )}


        {/* STEP 3 — Costs */}
        {stepIndex === 3 && <SelectCostFeatures selectedCosts={selectedCosts} />}
      </MarxanDialog>

      {/* Feature picker dialog */}
      <FeaturesDialog
        open={featureState.dialogs.featuresDialogOpen}
        onOk={updateSelectedFeatures}
        onCancel={() => dispatch(toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }))}
        loadingFeatures={false}
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

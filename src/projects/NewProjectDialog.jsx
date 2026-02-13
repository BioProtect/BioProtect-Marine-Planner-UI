import { MenuItem, Select } from "@mui/material";
import {
  setPlanningUnitGrids,
  useListPlanningUnitGridsQuery,
} from "@slices/planningUnitSlice";
import { setSelectedFeatureIds, toggleFeatureD } from "@slices/featureSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FeaturesDialog from "@features/FeaturesDialog";
import FileUpload from "../Uploads/FileUpload";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import MarxanDialog from "../MarxanDialog.jsx";
import PlanningUnitsDialog from "@planningGrids/PlanningUnitsDialog";
import ProjectFeaturesTable from "@projects/ProjectFeaturesTable";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import SelectCostFeatures from "../SelectCostFeatures.jsx";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { setAddingRemovingFeatures } from "../slices/featureSlice.js";
import { setCurrentPUGrid } from "../slices/planningUnitSlice.js";
import { setLoading } from "@slices/uiSlice";
import { toggleProjDialog } from "@slices/projectSlice.js";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";
import { useMemo } from "react";
import { usePlanningGridWebSocket } from "@hooks/usePlanningGridWebSocket";

const NewProjectDialog = ({
  loading,
  updateSelectedFeatures,
  selectedCosts,
  previewFeature,
  fileUpload,
}) => {
  const dispatch = useDispatch();
  const uiLoading = useSelector((state) => state.ui.loading);
  const fileUploadResponse = useSelector(
    (state) => state.ui.fileUploadResponse,
  );
  const featureDialogs = useSelector((state) => state.feature.dialogs);
  const selectedFeatureIds = useSelector(
    (state) => state.feature.selectedFeatureIds,
  );
  const projState = useSelector((state) => state.project);
  const currentPUGrid = useSelector(
    (state) => state.planningUnit.currentPUGrid,
  );

  // Track selectedFetaures so that if a new proect is being created the currents prject features arent used but also arent lost
  const dialogOpen = useSelector(
    (state) => state.project.dialogs.newProjectDialogOpen,
  );
  const prevSelectedFeatureIdsRef = useRef(null);
  const projectWasCreatedRef = useRef(false);

  // 0: Info, 1: Planning units (upload/select), 2: Features, 3: Costs
  const [steps] = useState(["Info", "Planning units", "Features", "Costs"]);
  const [stepIndex, setStepIndex] = useState(0);

  // project basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // planning grid choice
  const [puGrid, setPuGrid] = useState(""); // 'upload' | 'select'
  const [puMap, setPuMap] = useState(null);

  // upload - create grid inputs
  const [planningGridName, setPlanningGridName] = useState("");
  const [resolution, setResolution] = useState(7);
  const resolutionOptions = [
    { label: "Basin resolution (36 km²)", value: 6 },
    { label: "Regional resolution (5 km²)", value: 7 },
    { label: "Local resolution (0.7 km²)", value: 8 },
  ];

  // upload progress - continue automatically
  const [waitingForUpload, setWaitingForUpload] = useState(false);

  const { createPlanningGridViaWebSocket } = usePlanningGridWebSocket();
  const { showMessage } = useAppSnackbar();
  const { refetch: refetchPlanningUnitGrids } = useListPlanningUnitGridsQuery();

  const { data: allFeaturesResp } = useGetAllFeaturesQuery();
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? [];

  useEffect(() => {
    if (fileUploadResponse?.file) {
      setPlanningGridName(
        fileUploadResponse.file.replaceAll("_", " ").split(".")[0],
      );
    }
  }, [fileUploadResponse]);

  useEffect(() => {
    if (waitingForUpload) {
      setWaitingForUpload(false);
      setStepIndex(2);
    }
  }, [waitingForUpload]);

  useEffect(() => {
    if (stepIndex === 2) {
      dispatch(setAddingRemovingFeatures(true));
    }
  }, [stepIndex, dispatch]);

  useEffect(() => {
    if (dialogOpen) {
      // snapshot only once per open
      if (prevSelectedFeatureIdsRef.current == null) {
        prevSelectedFeatureIdsRef.current = selectedFeatureIds ?? [];
      }
      // clear for new project
      dispatch(setSelectedFeatureIds([]));
    } else {
      // dialog closed -> reset refs so next open re-snapshots
      prevSelectedFeatureIdsRef.current = null;
    }
  }, [dialogOpen]);

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
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false }),
    );
    await loadProject(response.name, response.user);
  };

  //creates a new planning grid unit
  const createPlanningUnitGrid = () => {
    createPlanningGridViaWebSocket(
      {
        shapefile_path: fileUploadResponse.file_path,
        alias: planningGridName,
        description: `Grid created from uploaded shapefile`,
        resolution: resolution,
      },
      {
        onUpdate: (msg) => {
          showMessage(msg);
          console.log(msg);
        },
        onSuccess: async (result) => {
          console.log("result ", result);
          if (result?.status === "error" || result?.error) {
            showMessage(
              result?.error || "Failed to create planning grid",
              "error",
            );
            return;
          }
          showMessage(result?.info || "Planning grid created");

          const updated = await refetchPlanningUnitGrids();
          console.log("updated ", updated);
          const grids = updated?.data?.planning_unit_grids || [];
          console.log("grids ", grids);

          if (grids.length > 0) {
            dispatch(setPlanningUnitGrids(grids));
            const newGrid = grids.find((g) => g.tilesetid === result.view_name);
            console.log("newGrid ", newGrid);

            if (newGrid?.tilesetid) {
              dispatch(setCurrentPUGrid(newGrid.tilesetid));
              console.log("Planning grid uploaded");
              showMessage("Planning grid uploaded", "success");
              setWaitingForUpload(true);
              dispatch(setLoading(false));
              return;
            }
          }
          dispatch(setLoading(false));
        },
        onError: (errMsg) => {
          dispatch(setLoading(false));
          showMessage(`❌ ${errMsg}`, "error");
        },
      },
    );
  };

  // ----------------------------------------------------------------

  // navigation
  const handleNext = () => setStepIndex((prev) => prev + 1);
  const handlePrev = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  // form handlers
  const handleChangeName = (e) => setName(e.target.value);
  const handleChangeDescription = (e) => setDescription(e.target.value);
  const handleRadioChange = (e) => setPuGrid(e.target.value);
  const handleOpenFeaturesDialog = () =>
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: true }),
    );

  const handleCreateNewPlanningGrid = async () => {
    console.log("filename,resolution: ", fileUploadResponse, resolution);
    dispatch(setLoading(true));
    try {
      console.log("creating planning unit grid.....");
      await createPlanningUnitGrid(
        fileUploadResponse.file,
        planningGridName,
        resolution,
      );
    } catch (error) {
      console.error("Error creating planning grid:", error);
      dispatch(setLoading(false)); // ensure we hide loading on immediate failure
      showMessage(`Error creating planning grid: ${error}`, "error");
    }
  };

  const clearAllFeatures = () => dispatch(setSelectedFeatureIds([]));

  const handleCreateNewProject = async () => {
    projectWasCreatedRef.current = true;

    await createNewProject({
      name,
      description,
      planning_grid_name: currentPUGrid,
      features: selectedFeatureIds,
    });

    closeDialog();
  };

  const closeDialog = () => {
    // Only restore if project was NOT created
    if (!projectWasCreatedRef.current) {
      if (prevSelectedFeatureIdsRef.current != null) {
        dispatch(setSelectedFeatureIds(prevSelectedFeatureIdsRef.current));
      }
    }
    // Reset flags
    projectWasCreatedRef.current = false;
    prevSelectedFeatureIdsRef.current = null;
    setStepIndex(0);
    dispatch(
      toggleProjDialog({ dialogName: "newProjectDialogOpen", isOpen: false }),
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
        onClick={
          stepIndex === steps.length - 1 ? handleCreateNewProject : handleNext
        }
        disabled={
          (stepIndex === 0 &&
            (name === "" || description === "" || puGrid === "")) ||
          (stepIndex === 1 && !currentPUGrid)
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
        title={`New project: ${steps[stepIndex]}`}
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
                Upload a shapefile to create a new planning grid or select one
                that already exists.
              </Typography>
              <RadioGroup
                name="pu-grid-options"
                value={puGrid}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value="upload"
                  control={<Radio />}
                  label="Upload a shapefile"
                />
                <FormControlLabel
                  value="select"
                  control={<Radio />}
                  label="Select from existing planning grids"
                />
              </RadioGroup>
            </Box>
          </FormControl>
        )}

        {/* STEP 1 — Upload OR Select existing */}
        {stepIndex === 1 && puGrid === "upload" && (
          <Box display="flex" flexDirection="column" gap={2}>
            <FileUpload
              loading={uiLoading}
              fileUpload={fileUpload}
              fileMatch=".zip"
              mandatory
              destFolder="data/tmp"
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
              <Select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                sx={{ width: 500 }}
              >
                {resolutionOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button
              variant="outlined"
              onClick={handleCreateNewPlanningGrid}
              disabled={!fileUploadResponse?.file || !planningGridName}
            >
              Create planning grid
            </Button>
          </Box>
        )}

        {stepIndex === 1 && puGrid === "select" && (
          <PlanningUnitsDialog
            previewFeature={previewFeature}
            puMap={puMap}
            setPuMap={setPuMap}
          />
        )}

        {/* STEP 2 — Features */}
        {stepIndex === 2 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: 390,
            }}
          >
            <ProjectFeaturesTable />

            <Box>
              <Button
                variant="contained"
                onClick={handleOpenFeaturesDialog}
                title="Add/remove features from the project"
              >
                +/-
              </Button>
            </Box>

            {/* Keep the dialog mounted so lazy-loading + selection work */}
            <FeaturesDialog
              open={featureDialogs.featuresDialogOpen}
              onOk={updateSelectedFeatures}
              onCancel={() =>
                dispatch(
                  toggleFeatureD({
                    dialogName: "featuresDialogOpen",
                    isOpen: false,
                  }),
                )
              }
              loadingFeatures={false}
              metadata={{ OLDVERSION: false }}
              userRole="User"
              previewFeature={previewFeature}
              preview={true}
            />
          </Box>
        )}

        {/* STEP 3 — Costs */}
        {stepIndex === 3 && (
          <SelectCostFeatures selectedCosts={selectedCosts} />
        )}
      </MarxanDialog>
    </>
  );
};

export default NewProjectDialog;

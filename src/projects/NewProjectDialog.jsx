import { Autocomplete } from "@mui/material";
import {
  setPlanningUnitGrids,
  useListPlanningUnitGridsQuery,
} from "@slices/planningUnitSlice";
import { setSelectedFeatureIds, toggleFeatureD } from "@slices/featureSlice.js";
import {
  toggleProjDialog,
  useCreateProjectMutation,
} from "@slices/projectSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

import BPDialog from "../BPDialog.jsx";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import DrawPlanningGridMap from "@planningGrids/DrawPlanningGridMap";
import FeaturesDialog from "@features/FeaturesDialog";
import FileUpload from "../Uploads/FileUpload";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import PlanningUnitsDialog from "@planningGrids/PlanningUnitsDialog";
import ProjectFeaturesTable from "@projects/ProjectFeaturesTable";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import ResolutionSelect from "@planningGrids/ResolutionSelect";
import SelectCostFeatures from "../SelectCostFeatures.jsx";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { selectCurrentUserId } from "@slices/authSlice";
import { setAddingRemovingFeatures } from "../slices/featureSlice.js";
import { setCurrentPUGrid } from "../slices/planningUnitSlice.js";
import { setLoading } from "@slices/uiSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";
import { useMemo } from "react";
import { usePlanningGridWebSocket } from "@hooks/usePlanningGridWebSocket";

// Suggestions only; any EPSG code PostGIS knows can be typed in.
const CRS_OPTIONS = [
  { code: "4326", label: "WGS 84 (lat/lon)" },
  { code: "3035", label: "ETRS89 / LAEA Europe" },
  { code: "2157", label: "IRENET95 / Irish Transverse Mercator" },
  { code: "2193", label: "NZGD2000 / New Zealand TM 2000" },
  { code: "3793", label: "NZGD2000 / Chatham Islands TM 2000" },
  { code: "6933", label: "WGS 84 / NSIDC EASE-Grid 2.0 Global (equal area)" },
];

const NewProjectDialog = ({
  loadProjectAndSetup,
  updateSelectedFeatures,
  selectedCosts,
  previewFeature,
  fileUpload,
}) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);

  const uiLoading = useSelector((s) => s.ui.loading);
  const fileUploadResponse = useSelector((s) => s.ui.fileUploadResponse);
  const featureDialogs = useSelector((s) => s.feature.dialogs);
  const selectedFeatureIds = useSelector((s) => s.feature.selectedFeatureIds);
  const projState = useSelector((s) => s.project);
  const currentPUGrid = useSelector((s) => s.planningUnit.currentPUGrid);

  // Track selectedFetaures so that if a new proect is being created the currents prject features arent used but also arent lost
  const dialogOpen = useSelector((s) => s.project.dialogs.newProjectDialogOpen);
  const prevSelectedFeatureIdsRef = useRef(null);
  const projectWasCreatedRef = useRef(false);

  // 0: Info, 1: Planning units (upload/select), 2: Features, 3: Costs
  const [steps] = useState(["Info", "Planning units", "Features", "Costs"]);
  const [stepIndex, setStepIndex] = useState(0);

  // project basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // EPSG code as a string; fixed once the project exists
  const [crsEpsg, setCrsEpsg] = useState("4326");

  // planning grid choice
  const [puGrid, setPuGrid] = useState(""); // 'upload' | 'select' | 'draw'
  const [drawnArea, setDrawnArea] = useState(null); // FeatureCollection when puGrid === 'draw'
  const [puMap, setPuMap] = useState(null);

  // upload - create grid inputs
  const [planningGridName, setPlanningGridName] = useState("");
  const [resolution, setResolution] = useState(7);

  // upload progress - continue automatically
  const [waitingForUpload, setWaitingForUpload] = useState(false);
  // latest progress message while a grid is being created, otherwise null
  const [gridStatus, setGridStatus] = useState(null);
  // true from clicking Finish until the new project has been created and loaded
  const [creating, setCreating] = useState(false);
  const [createProject, { isLoading, isError }] = useCreateProjectMutation();
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
    try {
      const payload = {
        userId: userId,
        project: proj.name,
        description: proj.description,
        planning_grid_name: proj.planning_grid_name,
        resolution: resolution,
        crs_epsg: Number(crsEpsg),
        interest_features: proj.features,
        target_values: proj.features.map(() => 17),
        spf_values: proj.features.map(() => 40),
      };
      const response = await createProject(payload).unwrap();
      // Server errors come back as HTTP 200 with an error field
      if (response.error) throw new Error(response.error);
      showMessage(response.info, "success");
      // e.g. the grid lies outside the CRS's area of use
      if (response.warning) showMessage(response.warning, "warning");
      dispatch(
        toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false }),
      );
      await loadProjectAndSetup(response.project_id);
      return response;
    } catch (error) {
      console.error("Error creating project:", error);
      showMessage(`Error creating project: ${error.message || error}`, "error");
      throw error;
    }
  };

  //creates a new planning grid unit
  const createPlanningUnitGrid = () => {
    setGridStatus("Starting...");
    createPlanningGridViaWebSocket(
      {
        ...(puGrid === "draw"
          ? { geojson: drawnArea, description: "Grid drawn on the map" }
          : {
              shapefile_path: fileUploadResponse.file_path,
              description: "Grid created from uploaded shapefile",
            }),
        alias: planningGridName,
        resolution: resolution,
      },
      {
        onUpdate: (msg) => setGridStatus(msg),
        onSuccess: async (result) => {
          setGridStatus(null);
          if (result?.status === "error" || result?.error) {
            showMessage(
              result?.error || "Failed to create planning grid",
              "error",
            );
            return;
          }

          const updated = await refetchPlanningUnitGrids();
          const grids = updated?.data?.planning_unit_grids || [];

          if (grids.length > 0) {
            dispatch(setPlanningUnitGrids(grids));
            const newGrid = grids.find((g) => g.tilesetid === result.view_name);

            if (newGrid?.tilesetid) {
              dispatch(setCurrentPUGrid(newGrid.tilesetid));
              setWaitingForUpload(true);
              return;
            }
          }
        },
        // the hook has already shown the error
        onError: () => setGridStatus(null),
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
    try {
      const resp = await createPlanningUnitGrid();
      return resp;
    } catch (error) {
      console.error("Error creating planning grid:", error);
      showMessage(`Error creating planning grid: ${error}`, "error");
    }
  };

  const handleCreateNewProject = async () => {
    if (creating) return; // ignore repeat clicks on Finish
    setCreating(true);
    dispatch(setLoading(true));
    projectWasCreatedRef.current = true;
    try {
      await createNewProject({
        name,
        description,
        planning_grid_name: currentPUGrid,
        features: selectedFeatureIds,
      });
      closeDialog();
    } catch {
      // createNewProject has already shown the error; stay on the dialog
      projectWasCreatedRef.current = false;
    } finally {
      setCreating(false);
      dispatch(setLoading(false));
    }
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
        disabled={stepIndex === 0 || creating}
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
            (name === "" ||
              description === "" ||
              puGrid === "" ||
              !/^\d+$/.test(crsEpsg))) ||
          (stepIndex === 1 && !currentPUGrid) ||
          creating
        }
      >
        {creating
          ? "Creating project…"
          : stepIndex === steps.length - 1
            ? "Finish"
            : "Next"}
      </Button>
    </div>
  );

  return (
    <>
      <BPDialog
        open={projState.dialogs.newProjectDialogOpen}
        loading={isLoading}
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
              <Autocomplete
                freeSolo
                autoSelect
                options={CRS_OPTIONS}
                getOptionLabel={(o) =>
                  typeof o === "string" ? o : `EPSG:${o.code} - ${o.label}`
                }
                value={CRS_OPTIONS.find((o) => o.code === crsEpsg) ?? crsEpsg}
                onChange={(e, v) =>
                  setCrsEpsg(
                    typeof v === "string"
                      ? v.replace(/^epsg:/i, "").trim()
                      : (v?.code ?? ""),
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    label="Coordinate reference system (EPSG code)"
                    error={!/^\d+$/.test(crsEpsg)}
                    helperText="Used for areas, exports, and files that have no CRS of their own. It can't be changed later."
                  />
                )}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Planning Grid Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a shapefile or draw an area to create a new planning
                grid, or select one that already exists.
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
                  value="draw"
                  control={<Radio />}
                  label="Draw on map (land is removed)"
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

        {/* STEP 1 — Upload, Draw OR Select existing */}
        {stepIndex === 1 && (puGrid === "upload" || puGrid === "draw") && (
          <Box display="flex" flexDirection="column" gap={2}>
            {puGrid === "upload" ? (
              <FileUpload
                loading={uiLoading}
                fileUpload={fileUpload}
                fileMatch=".zip"
                mandatory
                destFolder="imports"
                label="Shapefile (.zip)"
              />
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Click to add points, double-click to finish. Hexagons whose
                  centre is on land are removed.
                </Typography>
                <DrawPlanningGridMap onChange={setDrawnArea} />
              </>
            )}
            <TextField
              label="Planning grid name"
              fullWidth
              value={planningGridName}
              onChange={(e) => setPlanningGridName(e.target.value)}
            />
            <ResolutionSelect
              value={resolution}
              onChange={setResolution}
              geojson={puGrid === "draw" ? drawnArea : null}
              shapefilePath={
                puGrid === "upload" ? fileUploadResponse?.file_path : null
              }
            />
            <Button
              variant="outlined"
              onClick={handleCreateNewPlanningGrid}
              disabled={
                !(puGrid === "draw" ? drawnArea : fileUploadResponse?.file) ||
                !planningGridName ||
                !!gridStatus
              }
            >
              Create planning grid
            </Button>
            {gridStatus && (
              <Box>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {gridStatus}
                </Typography>
              </Box>
            )}
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
      </BPDialog>
    </>
  );
};

export default NewProjectDialog;

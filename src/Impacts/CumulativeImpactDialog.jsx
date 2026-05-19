import {
  faCheckCircle,
  faPlay,
  faPlusCircle,
  faTrashAlt,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import {
  setActivities,
  setUploadedActivities,
  toggleDialog,
} from "@slices/uiSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUpload from "../Uploads/FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MarxanDialog from "../MarxanDialog";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";

const CumulativeImpactDialog = ({
  _get,
  userRole,
  deleteCost,
  activateCostProfile,
  runCumulativeImpact,
  uploadRasterCost,
  getRasterBandInfo,
  fileUpload,
  handleWebSocket,
  startLogging,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projState = useSelector((state) => state.project);
  const selectedFeatureIds = useSelector(
    (state) => state.feature.selectedFeatureIds,
  );
  const { data: allFeaturesResp } = useGetAllFeaturesQuery();
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? [];

  const [tabIndex, setTabIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // Activities tab state
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");

  // Raster cost profile tab (tab 2) state — scoped here so it does not
  // leak into the activities tab.
  const [rasterFilename, setRasterFilename] = useState("");
  const [rasterProfileName, setRasterProfileName] = useState("");
  const [rasterProfileDescription, setRasterProfileDescription] = useState("");
  const [rasterBandInfo, setRasterBandInfo] = useState(null);
  const [rasterBand, setRasterBand] = useState(1);
  const [rasterStat, setRasterStat] = useState("weighted_mean");
  const [rasterNormalise, setRasterNormalise] = useState(true);
  const [rasterClampNegative, setRasterClampNegative] = useState(true);
  const [rasterFloor, setRasterFloor] = useState(0.001);
  const [rasterFillStrategy, setRasterFillStrategy] = useState("median");
  const [rasterSetActive, setRasterSetActive] = useState(true);

  const costProfiles = projState.projectCosts || [];

  const filteredProfiles = costProfiles.filter((p) =>
    p.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredActivities = uiState.uploadedActivities.filter(
    (activity) =>
      activity.activity?.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Preprocessing checks
  const projectFeatures = allFeatures.filter((f) =>
    selectedFeatureIds.includes(f.id),
  );
  const preprocessedFeatures = projectFeatures.filter((f) => f.preprocessed);
  const unprocessedFeatures = projectFeatures.filter((f) => !f.preprocessed);
  const allPreprocessed =
    projectFeatures.length > 0 && unprocessedFeatures.length === 0;
  const nonePreprocessed =
    projectFeatures.length === 0 || preprocessedFeatures.length === 0;

  // Pre-select the active cost profile when the dialog opens
  const activeProfile = costProfiles.find((p) => p.is_active);

  // Load activities once when the dialog opens
  const dialogOpen = dialogStates.cumulativeImpactDialogOpen;
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      setSelectedProfileId(activeProfile?.id ?? null);
    }
  }, [dialogOpen, activeProfile?.id]);

  useEffect(() => {
    if (dialogOpen && !activitiesLoaded) {
      setActivitiesLoaded(true);
      _get("getUploadedActivities").then((resp) => {
        if (resp?.data) {
          dispatch(setUploadedActivities(resp.data));
        }
      });
    }
    if (!dialogOpen) {
      setActivitiesLoaded(false);
    }
  }, [dialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const openHumanActivitiesDialog = useCallback(async () => {
    if (uiState.activities.length < 1) {
      const response = await _get("getActivities");
      const data = JSON.parse(response.data);
      dispatch(setActivities(data));
    }
    dispatch(
      toggleDialog({ dialogName: "humanActivitiesDialogOpen", isOpen: true }),
    );
  }, [_get, uiState.activities, dispatch]);

  const selectedProfile = costProfiles.find((p) => p.id === selectedProfileId);

  const handleActivateProfile = useCallback(async () => {
    if (selectedProfileId && activateCostProfile) {
      await activateCostProfile(selectedProfileId);
    }
  }, [selectedProfileId, activateCostProfile]);

  const handleDeleteCost = useCallback(async () => {
    if (selectedProfile && deleteCost) {
      const response = await deleteCost(selectedProfile.id);
      if (!response?.error) {
        setSelectedProfileId(null);
      }
    }
  }, [selectedProfile, deleteCost]);

  const toggleActivitySelection = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedActivityIds((prev) =>
      prev.includes(id)
        ? prev.filter((activityId) => activityId !== id)
        : [...prev, id],
    );
  };

  const toggleProfileSelection = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedProfileId((prev) => (prev === id ? null : id));
  };

  const handleRunCumulativeImpact = async () => {
    const response = await runCumulativeImpact(
      selectedActivityIds,
      profileName,
      profileDescription,
    );
    if (!response?.error) {
      setSelectedActivityIds([]);
      setProfileName("");
      setProfileDescription("");
      setTabIndex(0);
    }
  };

  // Probe band count / metadata once a raster has been uploaded.
  useEffect(() => {
    let cancelled = false;
    if (!rasterFilename || !getRasterBandInfo) {
      setRasterBandInfo(null);
      return;
    }
    (async () => {
      const info = await getRasterBandInfo(rasterFilename);
      if (cancelled) return;
      setRasterBandInfo(info);
      // Reset band selection to 1 whenever a new raster comes in.
      setRasterBand(1);
    })();
    return () => {
      cancelled = true;
    };
  }, [rasterFilename, getRasterBandInfo]);

  const handleUploadRasterCost = async () => {
    if (!uploadRasterCost) return;
    const response = await uploadRasterCost(
      rasterFilename,
      rasterProfileName,
      rasterProfileDescription,
      {
        band: rasterBand,
        stat: rasterStat,
        normalise: rasterNormalise,
        clampNegative: rasterClampNegative,
        floor: rasterFloor,
        fillStrategy: rasterFillStrategy,
        setActive: rasterSetActive,
      },
    );
    if (!response?.error) {
      // Reset tab 2 state, jump back to Cost Profiles list.
      setRasterFilename("");
      setRasterProfileName("");
      setRasterProfileDescription("");
      setRasterBandInfo(null);
      setRasterBand(1);
      setTabIndex(0);
    }
  };

  const canUploadRasterCost =
    !uiState.loading &&
    rasterFilename !== "" &&
    rasterProfileName !== "" &&
    rasterFloor > 0 &&
    rasterFloor < 1 &&
    userRole !== "ReadOnly";

  const canRunImpact =
    !uiState.loading &&
    selectedActivityIds.length > 0 &&
    profileName !== "" &&
    userRole !== "ReadOnly" &&
    !nonePreprocessed;

  const closeDialog = () => {
    setSelectedProfileId(null);
    setSearchText("");
    setSelectedActivityIds([]);
    setProfileName("");
    setProfileDescription("");
    setRasterFilename("");
    setRasterProfileName("");
    setRasterProfileDescription("");
    setRasterBandInfo(null);
    setRasterBand(1);
    dispatch(
      toggleDialog({
        dialogName: "cumulativeImpactDialogOpen",
        isOpen: false,
      }),
    );
  };

  return (
    <MarxanDialog
      open={dialogStates.cumulativeImpactDialogOpen}
      onOk={closeDialog}
      onCancel={closeDialog}
      loading={uiState.loading}
      autoDetectWindowHeight={false}
      title="Cumulative Impact"
      showSearchBox={true}
      searchText={searchText}
      searchTextChanged={setSearchText}
      fullWidth={true}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
          <Tab label="Cost Profiles" />
          <Tab label="Activities and Cumulative Impact" />
          <Tab label="Upload Raster Cost Profile" />
        </Tabs>
      </Box>

      {/* ── Cost Profiles Tab ── */}
      {tabIndex === 0 && (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow
                    key={profile.id}
                    hover
                    selected={selectedProfileId === profile.id}
                    onClick={() => toggleProfileSelection(profile.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProfileId === profile.id}
                        onChange={(e) => toggleProfileSelection(profile.id, e)}
                      />
                    </TableCell>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell align="right">
                      {profile.is_active && (
                        <Chip label="Active" color="primary" size="small" />
                      )}
                      {profile.is_default && !profile.is_active && (
                        <Chip label="Default" size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No cost profiles found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <ButtonGroup
            aria-label="Cost profile actions"
            fullWidth
            sx={{ mt: 2 }}
          >
            <Button
              color="success"
              startIcon={<CheckCircleIcon />}
              title="Set selected cost profile as active"
              onClick={handleActivateProfile}
              disabled={
                !selectedProfile ||
                selectedProfile.is_active ||
                uiState.loading ||
                userRole === "ReadOnly"
              }
            >
              Activate
            </Button>

            <Button
              color="error"
              startIcon={<DeleteIcon />}
              title="Delete selected cost profile"
              onClick={handleDeleteCost}
              disabled={
                !selectedProfile ||
                selectedProfile.is_active ||
                uiState.loading ||
                userRole === "ReadOnly"
              }
            >
              Delete
            </Button>
          </ButtonGroup>
        </>
      )}

      {/* ── Activities Tab ── */}
      {tabIndex === 1 && (
        <>
          {nonePreprocessed && (
            <Alert severity="error" sx={{ mb: 2 }}>
              No features have been preprocessed. Preprocess your features
              before running the cumulative impact function.
            </Alert>
          )}

          {!allPreprocessed && !nonePreprocessed && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {preprocessedFeatures.length} of {projectFeatures.length} features
              preprocessed.
              {unprocessedFeatures.length > 0 && (
                <>
                  {" "}
                  Missing:{" "}
                  {unprocessedFeatures
                    .slice(0, 5)
                    .map((f) => f.alias)
                    .join(", ")}
                  {unprocessedFeatures.length > 5 &&
                    ` and ${unprocessedFeatures.length - 5} more`}
                  .
                </>
              )}{" "}
              Unprocessed features will be excluded.
            </Alert>
          )}

          {allPreprocessed && (
            <Alert severity="success" sx={{ mb: 2 }}>
              All {projectFeatures.length} features preprocessed.
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow
                    key={activity.id}
                    selected={selectedActivityIds.includes(activity.id)}
                    onClick={() => toggleActivitySelection(activity.id)}
                    hover
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedActivityIds.includes(activity.id)}
                        onChange={(e) =>
                          toggleActivitySelection(activity.id, e)
                        }
                      />
                    </TableCell>
                    <TableCell>{activity.activity}</TableCell>
                    <TableCell>{activity.filename}</TableCell>
                    <TableCell>{activity.source}</TableCell>
                    <TableCell>{activity.created_by}</TableCell>
                    <TableCell>
                      {activity.creation_date?.substring(0, 10)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredActivities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No activities uploaded.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TextField
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            label="Cost profile name"
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            label="Description"
            variant="outlined"
            size="small"
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />

          <ButtonGroup aria-label="Activity actions" fullWidth sx={{ mt: 2 }}>
            <Button
              startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
              title="Upload a new activity"
              onClick={openHumanActivitiesDialog}
              disabled={uiState.loading || userRole === "ReadOnly"}
            >
              Add Activity
            </Button>

            <Button
              startIcon={<FontAwesomeIcon icon={faPlay} />}
              title={
                nonePreprocessed
                  ? "Preprocess features first"
                  : "Run cumulative impact"
              }
              onClick={handleRunCumulativeImpact}
              disabled={!canRunImpact}
            >
              Run Cumulative Impact
            </Button>
          </ButtonGroup>
        </>
      )}

      {/* ── Upload Raster Cost Profile Tab ── */}
      {tabIndex === 2 && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Upload a preprocessed raster (.tif) to use as the cost layer for
            this project. Values are sampled per hex with exactextract,
            log-normalised to [floor, 1] so no hex is ever zero-cost, and saved
            as a new cost profile.
          </Alert>

          <FileUpload
            fileUpload={fileUpload}
            fileMatch=".tif,.tiff"
            mandatory={true}
            filename={rasterFilename}
            setFilename={setRasterFilename}
            destFolder="imports"
            label="Upload Raster (.tif)"
            style={{ paddingTop: "10px" }}
          />

          <TextField
            fullWidth
            value={rasterProfileName}
            onChange={(e) => setRasterProfileName(e.target.value)}
            label="Cost profile name"
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            value={rasterProfileDescription}
            onChange={(e) => setRasterProfileDescription(e.target.value)}
            label="Description"
            variant="outlined"
            size="small"
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {rasterBandInfo && rasterBandInfo.band_count > 1 ? (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="raster-band-label">Band</InputLabel>
                <Select
                  labelId="raster-band-label"
                  label="Band"
                  value={rasterBand}
                  onChange={(e) => setRasterBand(Number(e.target.value))}
                >
                  {Array.from(
                    { length: rasterBandInfo.band_count },
                    (_, i) => i + 1,
                  ).map((b) => (
                    <MenuItem key={b} value={b}>
                      Band {b}
                      {rasterBandInfo.dtypes?.[b - 1]
                        ? ` (${rasterBandInfo.dtypes[b - 1]})`
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="raster-stat-label">Aggregation</InputLabel>
              <Select
                labelId="raster-stat-label"
                label="Aggregation"
                value={rasterStat}
                onChange={(e) => setRasterStat(e.target.value)}
              >
                <MenuItem value="weighted_mean">
                  Area-weighted mean (default)
                </MenuItem>
                <MenuItem value="mean">Mean</MenuItem>
                <MenuItem value="sum">Sum</MenuItem>
                <MenuItem value="max">Max</MenuItem>
                <MenuItem value="min">Min</MenuItem>
                <MenuItem value="median">Median</MenuItem>
                <MenuItem value="count">Count</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="raster-fill-label">
                Fill uncovered hexes
              </InputLabel>
              <Select
                labelId="raster-fill-label"
                label="Fill uncovered hexes"
                value={rasterFillStrategy}
                onChange={(e) => setRasterFillStrategy(e.target.value)}
              >
                <MenuItem value="median">Median observed (default)</MenuItem>
                <MenuItem value="floor">Floor</MenuItem>
                <MenuItem value="max">Max (1.0)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="number"
              label="Floor"
              value={rasterFloor}
              onChange={(e) =>
                setRasterFloor(parseFloat(e.target.value) || 0.001)
              }
              inputProps={{ step: 0.001, min: 0.0001, max: 0.999 }}
              sx={{ width: 120 }}
              helperText="Min cost (>0)"
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rasterNormalise}
                  onChange={(e) => setRasterNormalise(e.target.checked)}
                />
              }
              label="Apply log(X+1) normalisation"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rasterClampNegative}
                  onChange={(e) => setRasterClampNegative(e.target.checked)}
                />
              }
              label="Clamp negatives to 0"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rasterSetActive}
                  onChange={(e) => setRasterSetActive(e.target.checked)}
                />
              }
              label="Set as active profile"
            />
          </Stack>

          {rasterBandInfo ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Detected {rasterBandInfo.band_count} band
              {rasterBandInfo.band_count === 1 ? "" : "s"} ·{" "}
              {rasterBandInfo.width}×{rasterBandInfo.height} px · CRS{" "}
              {rasterBandInfo.crs_epsg
                ? `EPSG:${rasterBandInfo.crs_epsg}`
                : "(non-standard — will be reprojected)"}
            </Typography>
          ) : null}

          <ButtonGroup
            aria-label="Raster cost actions"
            fullWidth
            sx={{ mt: 2 }}
          >
            <Button
              startIcon={<FontAwesomeIcon icon={faUpload} />}
              title="Create a cost profile from the uploaded raster"
              onClick={handleUploadRasterCost}
              disabled={!canUploadRasterCost}
            >
              Create Cost Profile from Raster
            </Button>
          </ButtonGroup>
        </>
      )}
    </MarxanDialog>
  );
};

export default CumulativeImpactDialog;

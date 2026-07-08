import { faEraser, faLock, faSave } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ActivityListItem from "./ActivityListItem";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CONSTANTS from "../constants"; // Ensure this path is correct
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControl from "@mui/material/FormControl";
import HexagonIcon from "@mui/icons-material/Hexagon";
import HexagonOutlinedIcon from "@mui/icons-material/HexagonOutlined";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MenuItem from "@mui/material/MenuItem";
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { setShowPlanningGrid } from "@slices/planningUnitSlice";

const PlanningUnitsTab = ({
  project,
  preprocessing,
  userRole,
  costProfiles,
  activateCostProfile,
  map,
  onClickRef,
  puLayerIdsRef,
  _post,
  puEditing,
  setPuEditing,
  planningUnits,
  metadata,
  fetchCostProfileActivities,
  toggleActivityLayer,
  loadedActivityIds,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);

  // Build a quick lookup of puid → status, recomputed whenever the planningUnits array changes
  const planningUnitStatusMap = useMemo(() => {
    const map = {};
    for (const [status, ids] of Object.entries(planningUnits)) {
      ids.forEach((id) => {
        map[id] = Number(status);
      });
    }
    return map;
  }, [planningUnits]);

  // track edits locally not in state to help with rendering. save in state on save.
  const localEditsRef = useRef({}); // { h3_index: status }

  // currently box/click selected planning units, pending a status action
  const selectedIdsRef = useRef(new Set());
  const [selectionCount, setSelectionCount] = useState(0);
  const boxSelectRef = useRef({ start: null }); // in-progress drag-select
  const boxSelectHandlersRef = useRef(null); // canvas listeners, for cleanup

  // ── Activities for the active cost profile ────────────────────────────────
  const activeProfile = (costProfiles || []).find((p) => p.is_active);

  // Local selected profile id — drives BOTH the dropdown value and the
  // activities list. Updates immediately on user click so the UI responds
  // without waiting for the backend roundtrip in activateCostProfile.
  const [selectedProfileId, setSelectedProfileId] = useState(
    activeProfile?.id ?? "",
  );

  // Keep in sync if the active profile changes from outside (e.g. another
  // dialog activates a profile, or initial load).
  useEffect(() => {
    if (activeProfile?.id != null && activeProfile.id !== selectedProfileId) {
      setSelectedProfileId(activeProfile.id);
    }
  }, [activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCostProfileChange = (newId) => {
    setSelectedProfileId(newId);
    activateCostProfile?.(newId);
  };

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);

  // Stable ref to the fetcher so re-renders from _get → dispatch don't trigger
  // an infinite re-fetch loop.
  const fetchRef = useRef(fetchCostProfileActivities);
  useEffect(() => {
    fetchRef.current = fetchCostProfileActivities;
  }, [fetchCostProfileActivities]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedProfileId || !fetchRef.current) {
      setActivities([]);
      return;
    }
    setActivitiesLoading(true);
    setActivitiesError(null);
    (async () => {
      try {
        const resp = await fetchRef.current(selectedProfileId);
        if (cancelled) return;
        setActivities(resp?.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setActivitiesError(err?.message || "Failed to load activities");
          setActivities([]);
        }
      } finally {
        if (!cancelled) setActivitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedProfileId, project?.id]);

  // clears any selected feature-state + the selection ref/count, without touching status
  const clearSelection = () => {
    const { sourceId, sourceLayerName } = puLayerIdsRef.current || {};
    if (sourceId) {
      selectedIdsRef.current.forEach((puid) => {
        map.current.setFeatureState(
          { source: sourceId, sourceLayer: sourceLayerName, id: String(puid) },
          { selected: false },
        );
      });
    }
    selectedIdsRef.current.clear();
    setSelectionCount(0);
  };

  const applyStatusToSelection = (status) => {
    const { sourceId, sourceLayerName } = puLayerIdsRef.current;
    selectedIdsRef.current.forEach((puid) => {
      map.current.setFeatureState(
        { source: sourceId, sourceLayer: sourceLayerName, id: String(puid) },
        { status, selected: false },
      );
      localEditsRef.current[puid] = status;
    });
    selectedIdsRef.current.clear();
    setSelectionCount(0);
  };

  const startPuEditSession = (e) => {
    dispatch(setShowPlanningGrid(true));
    map.current.getCanvas().style.cursor = "crosshair";
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!puLayerId) {
      console.warn("No PU layer ID available yet");
      return;
    }
    const { sourceId, sourceLayerName } = puLayerIdsRef.current;

    onClickRef.current = (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [puLayerId],
      });
      if (!features.length) return;
      const feature = features[0];
      const puid =
        feature.properties.h3_index || feature.properties.puid || feature.id;
      if (!puid) return;

      const featureRef = {
        source: sourceId,
        sourceLayer: sourceLayerName,
        id: String(puid),
      };
      const nowSelected = !selectedIdsRef.current.has(puid);
      map.current.setFeatureState(featureRef, { selected: nowSelected });
      if (nowSelected) {
        selectedIdsRef.current.add(puid);
      } else {
        selectedIdsRef.current.delete(puid);
      }
      setSelectionCount(selectedIdsRef.current.size);
    };
    map.current.on("click", puLayerId, onClickRef.current);

    // drag-paint select: while dragging, select whatever PU is directly under
    // the cursor (a brush, not a bounding box) - lets you trace an irregular
    // patch of hexes precisely instead of grabbing everything in a rectangle.
    const canvas = map.current.getCanvas();
    const selectAtPoint = (evt) => {
      const features = map.current.queryRenderedFeatures(
        [evt.offsetX, evt.offsetY],
        { layers: [puLayerId] },
      );
      let changed = false;
      features.forEach((feature) => {
        const puid =
          feature.properties.h3_index || feature.properties.puid || feature.id;
        if (!puid || selectedIdsRef.current.has(puid)) return;
        selectedIdsRef.current.add(puid);
        map.current.setFeatureState(
          { source: sourceId, sourceLayer: sourceLayerName, id: String(puid) },
          { selected: true },
        );
        changed = true;
      });
      if (changed) setSelectionCount(selectedIdsRef.current.size);
    };
    const onMouseDown = (evt) => {
      if (evt.button !== 0) return;
      boxSelectRef.current.start = [evt.offsetX, evt.offsetY];
      map.current.dragPan.disable();
    };
    const onMouseMove = (evt) => {
      if (!boxSelectRef.current.start) return;
      selectAtPoint(evt);
    };
    const onMouseUp = () => {
      boxSelectRef.current.start = null;
      map.current.dragPan.enable();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    // bound to window, not canvas: releasing the mouse outside the map
    // (e.g. over the side panel) must still end the drag, or dragPan stays
    // disabled for the rest of the session.
    window.addEventListener("mouseup", onMouseUp);
    boxSelectHandlersRef.current = { onMouseDown, onMouseMove, onMouseUp };
  };

  const stopPuEditSession = (e) => {
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!puLayerId) {
      console.warn("No PU layer ID available yet");
      return;
    }
    dispatch(setShowPlanningGrid(false));
    map.current.getCanvas().style.cursor = "pointer";

    if (onClickRef.current) {
      map.current.off("click", puLayerId, onClickRef.current);
      onClickRef.current = null;
    }
    if (boxSelectHandlersRef.current) {
      const canvas = map.current.getCanvas();
      const { onMouseDown, onMouseMove, onMouseUp } =
        boxSelectHandlersRef.current;
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      boxSelectHandlersRef.current = null;
    }
    clearSelection();
    updateProjectPus();
  };

  const handlePUEditingClick = (e) => {
    if (puEditing) {
      setPuEditing(false);
      stopPuEditSession(e);
    } else {
      setPuEditing(true);
      startPuEditSession(e);
    }
  };

  const clearManualEdits = () => {
    const { sourceId, sourceLayerName } = puLayerIdsRef.current;
    for (const [id, status] of Object.entries(planningUnitStatusMap)) {
      map.current.setFeatureState(
        { source: sourceId, sourceLayer: sourceLayerName, id: String(id) },
        { status },
      );
    }
    localEditsRef.current = {};
    clearSelection();
  };

  const updateProjectPus = async () => {
    const base1 = new Set(planningUnits[1] || []);
    const base2 = new Set(planningUnits[2] || []);
    const localEdits = localEditsRef.current;

    for (const [h3, status] of Object.entries(localEdits)) {
      // remove from both first
      base1.delete(h3);
      base2.delete(h3);

      // add to target bucket if needed
      if (status === 1) {
        base1.add(h3);
      } else if (status === 2) {
        base2.add(h3);
      }
      // status 0 => stays removed
    }

    const status1Out = Array.from(base1);
    const status2Out = Array.from(base2);

    const formData = new FormData();
    formData.append("project_id", project.id);
    formData.append("status1", status1Out.join(","));
    formData.append("status2", status2Out.join(","));
    await _post("planning-units?action=update", formData);
  };

  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6" component="div">
              Planning Grid
            </Typography>

            <Typography variant="body2" component="p" color="text.secondary">
              {metadata.pu_alias}
            </Typography>

            <Divider />

            <Typography variant="h6" component="div">
              Planning Unit Statuses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {puEditing
                ? "Click, or drag a box, to select planning units — then apply a status"
                : "Mannually edit planning unit statuses"}
            </Typography>

            <Stack>
              {/* Top controls */}
              {/* Text + Edit Button */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: "100%" }}
              >
                <ButtonGroup
                  variant="outlined"
                  aria-label="Basic button group"
                  size="medium"
                >
                  {" "}
                  <Button
                    variant="outlined"
                    onClick={handlePUEditingClick}
                    size="medium"
                    endIcon={puEditing ? <SaveIcon /> : <EditIcon />}
                  >
                    {puEditing ? "Save" : "Edit"}
                  </Button>
                  {puEditing && (
                    <Button
                      size="medium"
                      variant="outlined"
                      onClick={clearManualEdits}
                      endIcon={<RestoreIcon />}
                    >
                      Clear Edits
                    </Button>
                  )}
                </ButtonGroup>
              </Stack>

              {puEditing && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ width: "100%", mt: 1 }}
                >
                  <ButtonGroup
                    variant="outlined"
                    size="medium"
                    disabled={selectionCount === 0}
                  >
                    <Button
                      size="medium"
                      variant="outlined"
                      onClick={() => applyStatusToSelection(1)}
                      endIcon={<LockIcon />}
                    >
                      Lock In
                    </Button>
                    <Button
                      size="medium"
                      variant="outlined"
                      onClick={() => applyStatusToSelection(2)}
                      endIcon={<LockIcon />}
                    >
                      Lock Out
                    </Button>
                    <Button
                      size="medium"
                      variant="outlined"
                      onClick={() => applyStatusToSelection(0)}
                      endIcon={<LockOpenIcon />}
                    >
                      Unlock
                    </Button>
                  </ButtonGroup>
                </Stack>
              )}
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  {selectionCount} selected
                </Typography>
              </Stack>

              <List
                dense={true}
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
              >
                <ListItem dense={true}>
                  <ListItemAvatar>
                    <HexagonOutlinedIcon sx={{ color: "##96969600" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Default" />
                </ListItem>

                <ListItem dense={true}>
                  <ListItemAvatar>
                    <HexagonIcon sx={{ color: "#3f3fbf" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Locked In" />
                </ListItem>

                <ListItem dense={true}>
                  <ListItemAvatar>
                    <HexagonIcon sx={{ color: "#bf3f3f" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Locked Out" />
                </ListItem>
              </List>
            </Stack>

            <Divider />

            <Typography variant="h6" component="div">
              Costs
            </Typography>

            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="protected-areas-label">
                Use cost surface
              </InputLabel>
              <Select
                labelId="costs-select-label"
                id="costs-select"
                value={selectedProfileId}
                disabled={preprocessing || userRole === "ReadOnly"}
                label="Use cost surface"
                onChange={(event) =>
                  handleCostProfileChange(event.target.value)
                }
              >
                {(costProfiles ?? []).map((profile) => (
                  <MenuItem value={profile.id} key={profile.id}>
                    {profile.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Accordion
              disableGutters
              elevation={0}
              sx={{
                border: "1px solid #e0ecec",
                borderRadius: "8px",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  minHeight: 40,
                  "& .MuiAccordionSummary-content": { my: 0.5 },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ flex: 1 }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Activities
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: "auto" }}
                  >
                    {selectedProfileId ? `${activities.length}` : "—"}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1, pt: 0 }}>
                {!selectedProfileId && (
                  <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                    Activate a cost profile to see its activities.
                  </Alert>
                )}

                {selectedProfileId && activitiesLoading && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      py: 2,
                    }}
                  >
                    <CircularProgress size={20} />
                  </Box>
                )}

                {selectedProfileId && activitiesError && (
                  <Alert severity="error" sx={{ fontSize: "0.8rem" }}>
                    {activitiesError}
                  </Alert>
                )}

                {selectedProfileId &&
                  !activitiesLoading &&
                  !activitiesError &&
                  activities.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 1.5 }}
                    >
                      No activities associated with this profile.
                    </Typography>
                  )}

                {selectedProfileId && activities.length > 0 && (
                  <List
                    sx={{
                      maxHeight: "40vh",
                      overflowY: "none",
                      px: 0,
                      py: 0,
                    }}
                  >
                    {activities.map((activity) => {
                      const isActive = !!loadedActivityIds?.[activity.id];
                      const color =
                        Array.isArray(window.colors) && window.colors.length
                          ? window.colors[activity.id % window.colors.length]
                          : "#F5C043";
                      return (
                        <ActivityListItem
                          key={`activity-${activity.id}`}
                          activity={activity}
                          isActive={isActive}
                          layerColor={color}
                          onClick={(evt, a) => {
                            evt.stopPropagation();
                            toggleActivityLayer?.(a);
                          }}
                        />
                      );
                    })}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanningUnitsTab;

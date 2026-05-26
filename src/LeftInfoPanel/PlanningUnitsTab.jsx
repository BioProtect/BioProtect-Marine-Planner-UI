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
import CropSquareIcon from "@mui/icons-material/CropSquare";
import Divider from "@mui/material/Divider";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";
import Select from "@mui/material/Select";
import SquareIcon from "@mui/icons-material/Square";
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
  onContextMenuRef,
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

  const startPuEditSession = (e) => {
    dispatch(setShowPlanningGrid(true));
    map.current.getCanvas().style.cursor = "crosshair";
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!puLayerId) {
      console.warn("No PU layer ID available yet");
      return;
    }
    onClickRef.current = (e) => updatePlanningUnitStatus(e, "change");
    onContextMenuRef.current = (e) => updatePlanningUnitStatus(e, "reset");

    map.current.on("click", puLayerId, onClickRef.current);
    map.current.on("contextmenu", puLayerId, onContextMenuRef.current);
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
    if (onContextMenuRef.current) {
      map.current.off("contextmenu", puLayerId, onContextMenuRef.current);
      onContextMenuRef.current = null;
    }
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

  const updatePlanningUnitStatus = (e, mode = "change") => {
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!map.current?.getLayer(puLayerId)) return;

    const features = map.current.queryRenderedFeatures(e.point, {
      layers: [puLayerId],
    });
    if (!features.length) return;

    const feature = features[0];
    const puid =
      feature.properties.h3_index || feature.properties.puid || feature.id;
    if (!puid) return;

    // Determine current & next status
    const featureRef = {
      source: puLayerIdsRef.current.sourceId,
      sourceLayer: puLayerIdsRef.current.sourceLayerName,
      id: String(puid),
    };
    const currentState = map.current.getFeatureState(featureRef);
    const currentStatus = [0, 1, 2].includes(currentState?.status)
      ? currentState.status
      : 0;

    const nextStatus = mode === "reset" ? 0 : (currentStatus + 1) % 3;
    if (currentStatus === nextStatus) return;

    // Update feature state for instant visual feedback
    map.current.setFeatureState(featureRef, { status: nextStatus });

    // Track locally
    localEditsRef.current[puid] = nextStatus;
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
                ? "Click on a planning unit to change its status"
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
                    <CropSquareIcon sx={{ color: "##96969600" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Default" />
                </ListItem>

                <ListItem dense={true}>
                  <ListItemAvatar>
                    <SquareIcon sx={{ color: "#3f3fbf" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Locked In" />
                </ListItem>

                <ListItem dense={true}>
                  <ListItemAvatar>
                    <SquareIcon sx={{ color: "#bf3f3f" }} />
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

import { faEraser, faLock, faSave } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useRef, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CONSTANTS from "../constants"; // Ensure this path is correct
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import Divider from "@mui/material/Divider";
import EditIcon from "@mui/icons-material/Edit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  preprocessing,
  userRole,
  changeCostname,
  map,
  onClickRef,
  onContextMenuRef,
  puLayerIdsRef,
  _post,
  puEditing,
  setPuEditing,
  planningUnits,
  metadata,
  costname,
  costNames,
}) => {
  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit);
  const projState = useSelector((state) => state.project);
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

  const startPuEditSession = (e) => {
    dispatch(setShowPlanningGrid(true));
    map.current.getCanvas().style.cursor = "crosshair";
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!puLayerId) {
      console.warn("No PU layer ID available yet");
      return;
    }
    // assign handlers
    // onClickRef.current = (e) => updatePlanningUnitStatus(e, "cycle");
    // onContextMenuRef.current = (e) => updatePlanningUnitStatus(e, "reset");
    // const puLayerId = puLayerIdsRef.current?.puLayerId;
    // if (!puLayerId) {
    //   console.warn("No PU layer ID available yet");
    //   return;
    // }
    // map.current.on("click", puLayerId, onClickRef.current);
    // map.current.on("contextmenu", puLayerId, onContextMenuRef.current);
    onClickRef.current = (e) => updatePlanningUnitStatus(e, "change");
    onContextMenuRef.current = (e) => updatePlanningUnitStatus(e, "reset");

    map.current.on("click", puLayerId, onClickRef.current);
    map.current.on("contextmenu", puLayerId, onContextMenuRef.current);
    // renderPuEditLayer();
  };

  const stopPuEditSession = (e) => {
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!puLayerId) {
      console.warn("No PU layer ID available yet");
      return;
    }
    dispatch(setShowPlanningGrid(false));
    setPuEditing(false);
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
        { status }
      );
    }
    localEditsRef.current = {};
  };

  const updateProjectPus = async () => {
    const formData = new FormData();
    formData.append("user", uiState.owner);
    formData.append("project", projState.project);

    for (const [status, ids] of Object.entries(planningUnits)) {
      formData.append(`status${status}`, ids);
    }

    await _post("planning_units?action=update", formData);
  };

  function appPuidsToPlanningUnits(statuses, status, puids) {
    const newStatuses = { ...statuses };
    //  Get the current list for this status or start with an empty array
    const currentList = newStatuses[status] || [];
    //  Combine old and new PU IDs and Remove duplicates
    const uniqueIds = Array.from(new Set([...currentList, ...puids]));
    newStatuses[status] = uniqueIds;
    return newStatuses;
  }

  const removePuidsFromArray = (statuses, status, puids) => {
    const newStatuses = { ...statuses };
    const currentList = newStatuses[status] || [];
    // remove matching IDs
    const remaining = currentList.filter((id) => !puids.includes(id));
    if (remaining.length > 0) {
      newStatuses[status] = remaining;
    } else {
      delete newStatuses[status];
    }
    return newStatuses;
  };

  // const updatePlanningUnitStatus = (e, mode = "change") => {
  //   const puLayerId = CONSTANTS.PU_LAYER_NAME;
  //   if (!map.current?.getLayer(puLayerId)) return;

  //   // find clicked feature
  //   const features = map.current.queryRenderedFeatures(e.point, { layers: [puLayerId] });
  //   if (!features.length) return;

  //   const puid = features[0].properties.h3_index || features[0].properties.puid;

  //   // get current and next statsu
  //   const currentStatus = planningUnitStatusMap[puid] ?? 0;
  //   const nextStatus = mode === "reset" ? 0 : (currentStatus + 1) % 3;

  //   let updated = removePuidsFromArray(planningUnits, currentStatus, [puid]);
  //   updated = appPuidsToPlanningUnits(updated, nextStatus, [puid]);
  //   dispatch(setProjectPlanningUnits(updated));

  //   const featureRef = {
  //     source: puLayerIdsRef.current.sourceId,
  //     sourceLayer: puLayerIdsRef.current.sourceLayerName,
  //     id: puid,  // h3_index value
  //   };
  //   map.current.setFeatureState(featureRef, { status: nextStatus });
  // };
  const updatePlanningUnitStatus = (e, mode = "change") => {
    console.log("updatePlanningUnitStatus ");
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
    console.log("planningUnitStatusMap[puid] ", planningUnitStatusMap[puid]);

    // Determine current & next status
    const featureRef = {
      source: puLayerIdsRef.current.sourceId,
      sourceLayer: puLayerIdsRef.current.sourceLayerName,
      id: String(puid),
    };
    const currentState = map.current.getFeatureState(featureRef);
    const currentStatus = currentState?.status ?? 0;

    // const currentStatus = planningUnitStatusMap[puid] ?? 0;
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
          <Stack spacing={2}>
            <Typography variant="h5" component="div">
              Planning Grid
            </Typography>

            <Typography variant="body1" component="div">
              <span className="description">{metadata.pu_alias}</span>
            </Typography>

            <Divider />

            <Typography variant="h5" component="div">
              Planning Unit Statuses
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {puEditing
                ? "Click on a planning unit to change its status"
                : "Mannually edit planning unit statuses"}
            </Typography>

            <Stack spacing={2}>
              {/* Top controls */}
              <Stack direction="row" spacing={2} alignItems="center">
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
                  >
                    {" "}
                    <Button
                      variant="outlined"
                      onClick={handlePUEditingClick}
                      endIcon={puEditing ? <SaveIcon /> : <EditIcon />}
                    >
                      {puEditing ? "Save" : "Edit"}
                    </Button>
                    {puEditing && (
                      <Button
                        variant="outlined"
                        onClick={clearManualEdits}
                        endIcon={<RestoreIcon />}
                      >
                        Clear Edits
                      </Button>
                    )}
                  </ButtonGroup>
                </Stack>
              </Stack>

              <List
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
              >
                <ListItem>
                  <ListItemAvatar>
                    <CropSquareIcon sx={{ color: "##96969600" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Default" />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <SquareIcon sx={{ color: "#3f3fbf" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Locked In" />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <SquareIcon sx={{ color: "#bf3f3f" }} />
                  </ListItemAvatar>
                  <ListItemText primary="Locked Out" />
                </ListItem>
              </List>
            </Stack>

            <Divider />

            <Typography variant="h5" component="div">
              Costs
            </Typography>

            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="protected-areas-label">
                Use cost surface
              </InputLabel>
              <Select
                labelId="costs-select-label"
                id="costs-select"
                value={(() => {
                  const names = costNames ?? [];
                  const current = costname;
                  // if current is in the list, use it; otherwise pick the first element (if any)
                  return names.includes(current) ? current : (names[0] ?? ""); // if names[0] is undefined, fall back to empty string
                })()}
                disabled={preprocessing || userRole === "ReadOnly"}
                label="Use cost surface"
                onChange={(event) => changeCostname(event)}
              >
                {costNames.map((item) => {
                  return (
                    <MenuItem value={item} key={item}>
                      {item}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanningUnitsTab;

import { faEraser, faLock, faSave } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";

import Button from "@mui/material/Button";
import CONSTANTS from "../constants"; // Ensure this path is correct
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
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
}) => {
  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit)
  const projState = useSelector((state) => state.project)
  const uiState = useSelector((state) => state.ui);
  const metadata = projState.projectData.metadata;

  // Build a quick lookup of puid → status, recomputed whenever the planningUnits array changes
  const planningUnitStatusMap = useMemo(() => {
    const map = {};
    for (const [status, ids] of Object.entries(projState.projectPlanningUnits)) {
      ids.forEach((id) => {
        map[id] = Number(status);
      });
    }
    return map;
  }, [projState.projectPlanningUnits]);

  const startPuEditSession = (e) => {
    dispatch(setShowPlanningGrid(true));
    setPuEditing(true);
    map.current.getCanvas().style.cursor = "crosshair";

    // assign handlers
    onClickRef.current = updatePlanningUnitStatus(e, "change");
    onContextMenuRef.current = updatePlanningUnitStatus(e, "reset");


    map.current.on("click", CONSTANTS.PU_LAYER_NAME, onClickRef.current);
    map.current.on("contextmenu", CONSTANTS.PU_LAYER_NAME, onContextMenuRef.current);
  };

  const stopPuEditSession = (e) => {
    dispatch(setShowPlanningGrid(false));
    setPuEditing(false);
    map.current.getCanvas().style.cursor = "pointer";

    if (onClickRef.current) {
      map.current.off("click", CONSTANTS.PU_LAYER_NAME, onClickRef.current);
      onClickRef.current = null;
    }
    if (onContextMenuRef.current) {
      map.current.off("contextmenu", CONSTANTS.PU_LAYER_NAME, onContextMenuRef.current);
      onContextMenuRef.current = null;
    }
    updateProjectPus();
  };

  const handlePUEditingClick = (e) => (puEditing) ? stopPuEditSession(e) : startPuEditSession(e);

  const clearManualEdits = () => {
    dispatch(setProjectPlanningUnits({}));
  };

  const updateProjectPus = async () => {
    const formData = new FormData();
    formData.append("user", uiState.owner);
    formData.append("project", projState.project);

    for (const [status, ids] of Object.entries(projState.projectPlanningUnits)) {
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
  }

  const updatePlanningUnitStatus = (e, mode = "change") => {
    const puLayerId = CONSTANTS.PU_LAYER_NAME;
    if (!map.current?.getLayer(puLayerId)) return;

    // find clicked feature
    const features = map.current.queryRenderedFeatures(e.point, { layers: [puLayerId] });
    if (!features.length) return;

    const puid = features[0].properties.h3_index || features[0].properties.puid;

    // get current and next statsu
    const currentStatus = planningUnitStatusMap[puid] ?? 0;
    const nextStatus = mode === "reset" ? 0 : (currentStatus + 1) % 3;

    let updated = removePuidsFromArray(projState.projectPlanningUnits, currentStatus, [puid]);
    updated = appPuidsToPlanningUnits(updated, nextStatus, [puid]);
    dispatch(setProjectPlanningUnits(updated));

    const featureRef = {
      source: puLayerIdsRef.current.sourceId,
      sourceLayer: puLayerIdsRef.current.sourceLayerName,
      id: puid,  // h3_index value
    };
    map.current.setFeatureState(featureRef, { status: nextStatus });
  };

  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" component="div">Planning Grid</Typography>

            <Typography variant="body1" component="div">
              <span className="description">{metadata.pu_alias}</span>
            </Typography>

            <Typography variant="h5" component="div">Statuses</Typography>

            <Stack direction="row" spacing={4} >

              <Typography variant="body1" color="text.secondary" >
                <Button variant="outlined" onClick={(e) => handlePUEditingClick(e)}>
                  <FontAwesomeIcon
                    icon={puEditing ? faSave : faLock}
                    title={puEditing ? "Save" : "Manually edit"}
                  />
                </Button>
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {puEditing
                  ? "Click on the map to change the status"
                  : "Manually edit"}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <Button
                  variant="outlined"
                  onClick={(e) => clearManualEdits(e)}
                  style={{
                    display: puState.puEditing ? "inline-block" : "none",
                  }}>
                  <FontAwesomeIcon
                    icon={faEraser}
                    title={"Clear all manual edits"}
                  />
                </Button>
              </Typography>

            </Stack>

            <Typography variant="h5" component="div">
              Costs
            </Typography>

            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="protected-areas-label">Use cost surface</InputLabel>
              <Select
                labelId="costs-select-label"
                id="costs-select"
                value={(() => {
                  const names = projState.projectData.costnames ?? [];
                  const current = projState.projectData.costname;
                  // if current is in the list, use it; otherwise pick the first element (if any)
                  return names.includes(current)
                    ? current
                    : names[0] ?? '';  // if names[0] is undefined, fall back to empty string
                })()}
                disabled={preprocessing || userRole === "ReadOnly"}
                label="Use cost surface"
                onChange={(event) => changeCostname(event)}
              >
                {projState.projectData.costnames.map((item) => {
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
    </div >
  );
};

export default PlanningUnitsTab;

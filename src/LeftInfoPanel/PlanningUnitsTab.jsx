import { faEraser, faLock, faSave } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useRef, useState } from "react";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { setProjectPlanningUnits } from "@slices/projectSlice";
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
  renderPuEditLayer,
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
      ids.forEach((id) => (map[id] = Number(status)));
    }
    return map;
  }, [projState.projectPlanningUnits]);

  // 🔹 Track live edits locally (not Redux)
  const localEditsRef = useRef({}); // { h3_index: status }


  const startPuEditSession = () => {
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
    renderPuEditLayer();
  };

  const stopPuEditSession = () => {
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!puLayerId) return;

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
  };


  const handlePUEditingClick = () => {
    if (puEditing.current) {
      stopPuEditSession();
      saveEdits();
    } else {
      setPuEditing(true);
      startPuEditSession();
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


  const updatePlanningUnitStatus = (e, mode = "change") => {
    const puLayerId = puLayerIdsRef.current?.puLayerId;
    if (!map.current?.getLayer(puLayerId)) return;

    // find clicked feature
    const features = map.current.queryRenderedFeatures(e.point, { layers: [puLayerId] });
    if (!features.length) return;

    const puid = features[0].properties.h3_index || features[0].properties.puid;

    // determine current and next status
    const currentStatus = planningUnitStatusMap[puid] ?? 0;
    const nextStatus = mode === "reset" ? 0 : (currentStatus + 1) % 3;
    if (currentStatus === nextStatus) return; // no change needed

    // ✅ Always preserve 0/1/2 arrays — ensure they exist
    let updated = { ...projState.projectPlanningUnits };
    updated[0] = Array.isArray(updated[0]) ? [...updated[0]] : [];
    updated[1] = Array.isArray(updated[1]) ? [...updated[1]] : [];
    updated[2] = Array.isArray(updated[2]) ? [...updated[2]] : [];

    // ✅ Remove the puid from *all* status buckets (enforces exclusivity)
    updated[0] = updated[0].filter((id) => id !== puid);
    updated[1] = updated[1].filter((id) => id !== puid);
    updated[2] = updated[2].filter((id) => id !== puid);

    // ✅ Add to the correct next bucket
    if (!updated[nextStatus].includes(puid)) {
      updated[nextStatus].push(puid);
    }

    // ✅ Dispatch — keeps all buckets intact
    dispatch(setProjectPlanningUnits(updated));

    // ✅ Update feature-state instantly for visual feedback
    try {
      const featureRef = {
        source: puLayerIdsRef.current.sourceId,
        sourceLayer: puLayerIdsRef.current.sourceLayerName,
        id: String(puid),
      };
      map.current.setFeatureState(featureRef, { status: nextStatus });
    } catch (err) {
      console.warn("⚠️ setFeatureState failed for", puid, err.message);
    }
  };



  const saveEdits = async () => {
    const merged = { ...projState.projectPlanningUnits };
    const grouped = { 0: [], 1: [], 2: [] };

    // Group all changes
    for (const [puid, status] of Object.entries(localEditsRef.current)) {
      grouped[status].push(puid);
    }

    for (const [status, ids] of Object.entries(grouped)) {
      if (!ids.length) continue;
      merged[status] = Array.from(new Set([...(merged[status] || []), ...ids]));
    }

    dispatch(setProjectPlanningUnits(merged));

    const project = projState.projectData.project;
    const formData = new FormData();
    formData.append("project_id", project.id);
    for (const [status, ids] of Object.entries(merged)) {
      formData.append(`status${status}`, (ids || []).join(","));
    }

    await _post("planning-units?action=update", formData);
    localEditsRef.current = {}; // reset after save
    setPuEditing(false);
  };


  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Planning Grid</Typography>
            <Typography variant="body1">{metadata.pu_alias}</Typography>

            <Typography variant="h5">Statuses</Typography>
            <Stack direction="row" spacing={4}>
              <Button variant="outlined" onClick={handlePUEditingClick}>
                <FontAwesomeIcon icon={puEditing.current ? faSave : faLock} />
                {puEditing.current ? " Save" : " Manually Edit"}
              </Button>

              <Button
                variant="outlined"
                onClick={clearManualEdits}
                sx={{ display: puEditing.current ? "inline-block" : "none" }}
              >
                <FontAwesomeIcon icon={faEraser} /> Clear
              </Button>
            </Stack>

            <Typography variant="h5">Costs</Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="costs-label">Use cost surface</InputLabel>
              <Select
                labelId="costs-label"
                id="costs-select"
                value={projState.projectData.costname || ""}
                disabled={preprocessing || userRole === "ReadOnly"}
                label="Use cost surface"
                onChange={(event) => changeCostname(event)}
              >
                {(projState.projectData.costnames || []).map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanningUnitsTab;
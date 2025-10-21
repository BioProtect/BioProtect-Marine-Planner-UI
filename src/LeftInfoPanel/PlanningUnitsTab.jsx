import React, { useState } from "react";
import { faEraser, faLock, faSave } from "@fortawesome/free-solid-svg-icons";
import { setPuEditing, setShowPlanningGrid } from "@slices/planningUnitSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import CONSTANTS from "../constants"; // Ensure this path is correct
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const PlanningUnitsTab = ({
  preprocessing, userRole, changeIucnCategory, changeCostname, updateProjectPus, clearManualEdits, map, onClickRef, onContextMenuRef
}) => {
  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit)
  const projState = useSelector((state) => state.project)
  const metadata = projState.projectData.metadata;

  const startPuEditSession = () => {
    dispatch(setShowPlanningGrid(true));
    dispatch(setPuEditing(true));
    map.current.getCanvas().style.cursor = "crosshair";

    // assign handlers
    onClickRef.current = moveStatusUp;
    onContextMenuRef.current = resetStatus;
    map.current.on("click", CONSTANTS.PU_LAYER_NAME, onClickRef.current);
    map.current.on("contextmenu", CONSTANTS.PU_LAYER_NAME, onContextMenuRef.current);
  };

  const stopPuEditSession = () => {
    dispatch(setShowPlanningGrid(false));
    dispatch(setPuEditing(false));
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


  const handlePUEditingClick = () => {
    if (puState.puEditing) {
      stopPuEditSession();
    } else {
      startPuEditSession();
    }
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
                <Button variant="outlined" onClick={handlePUEditingClick}>
                  <FontAwesomeIcon
                    icon={puState.puEditing ? faSave : faLock}
                    title={puState.puEditing ? "Save" : "Manually edit"}
                  />
                </Button>
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {puState.puEditing
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
            <FormControl sx={{ m: 1, minWidth: 120 }} >
              <InputLabel id="protected-areas-label">Lock in Protected Areas</InputLabel>
              <Select
                labelId="protected-areas-label"
                id="protected-areas"
                value={
                  CONSTANTS.IUCN_CATEGORIES.includes(metadata.IUCN_CATEGORY)
                    ? metadata.IUCN_CATEGORY
                    : CONSTANTS.IUCN_CATEGORIES[0] ?? ''
                }
                disabled={preprocessing || userRole === "ReadOnly"}
                label="Lock in protected areas"
                onChange={(event) => changeIucnCategory(event)}
              >
                {CONSTANTS.IUCN_CATEGORIES.map((item) => {
                  return (
                    <MenuItem value={item} key={item}>
                      {item}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>


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

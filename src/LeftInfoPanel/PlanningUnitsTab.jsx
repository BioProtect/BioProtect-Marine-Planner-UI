import React, { useState } from "react";
import { faEraser, faLock, faSave } from "@fortawesome/free-solid-svg-icons";

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
import { useSelector } from "react-redux";

const PlanningUnitsTab = (props) => {
  const puState = useSelector((state) => state.planningUnit)
  const projState = useSelector((state) => state.project)
  const metadata = projState.projectData.metadata;
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

            <Stack direction="row" spacing={4}>

              <Typography variant="body1" color="text.secondary">
                <FontAwesomeIcon
                  icon={puState.puEditing ? faSave : faLock}
                  onClick={props.startStopPuEditSession}
                  title={puState.puEditing ? "Save" : "Manually edit"}
                />
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {puState.puEditing
                  ? "Click on the map to change the status"
                  : "Manually edit"}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <span
                  style={{
                    display: puState.puEditing ? "inline-block" : "none",
                  }}
                  className="puManualEditClear"
                >
                  <FontAwesomeIcon
                    icon={faEraser}
                    onClick={(e) => props.clearManualEdits(e)}
                    title={"Clear all manual edits"}
                    style={{
                      cursor: "pointer",
                      color: "rgba(255, 64, 129, 0.7)",
                    }}
                  />
                </span>
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
                disabled={props.preprocessing || props.userRole === "ReadOnly"}
                label="Lock in protected areas"
                onChange={(event) => props.changeIucnCategory(event)}
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
                disabled={props.preprocessing || props.userRole === "ReadOnly"}
                label="Use cost surface"
                onChange={(event) => props.changeCostname(event)}
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

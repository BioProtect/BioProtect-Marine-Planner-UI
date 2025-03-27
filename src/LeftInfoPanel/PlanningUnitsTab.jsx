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
  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" component="div">
              Planning Grid
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              <p className="description">{props.metadata.pu_alias}</p>
            </Typography>

            <Typography variant="h5" component="div">
              Statuses
            </Typography>
            <Stack direction="row" spacing={4}>
              <Typography variant="subtitle1" color="text.secondary">
                <FontAwesomeIcon
                  icon={puState.puEditing ? faSave : faLock}
                  onClick={props.startStopPuEditSession}
                  title={puState.puEditing ? "Save" : "Manually edit"}
                />
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {puState.puEditing
                  ? "Click on the map to change the status"
                  : "Manually edit"}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
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

            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="protected-areas-label">
                Lock in Protected Areas
              </InputLabel>
              <Select
                labelId="protected-areas-label"
                id="protected-areas"
                value={props.metadata.IUCN_CATEGORY}
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
              <InputLabel id="protected-areas-label">
                Use cost surface
              </InputLabel>
              <Select
                labelId="costs-select-label"
                id="costs-select"
                value={props.costname}
                disabled={props.preprocessing || props.userRole === "ReadOnly"}
                label="Use cost surface"
                onChange={(event) => props.changeCostname(event)}
              >
                {props.costnames.map((item) => {
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

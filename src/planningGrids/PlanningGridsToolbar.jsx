import {
  faFileCode,
  faPlusCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ExportIcon from "@mui/icons-material/Publish";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImportIcon from "@mui/icons-material/GetApp";
import React from "react";

const PlanningGridsToolbar = (props) => {
  return (
    <ButtonGroup aria-label="Basic button group">
      <Button
        startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
        title="New planning grid"
        onClick={props.handleNew}
      >
        New
      </Button>
      <Button
        startIcon={<FontAwesomeIcon icon={faFileCode} />}
        title="Import from simple Shapefile"
        onClick={props.handleNewMarine}
      >
        Import Shapefile
      </Button>
      {props.unauthorisedMethods.includes("importPlanningUnitGrid") ? null : (
        <Button
          startIcon={<ImportIcon style={{ height: "20px", width: "20px" }} />}
          title="Import an existing planning grid from the local machine"
          onClick={props.openImportDialog}
        >
          Import Planning Grid
        </Button>
      )}
      {props.unauthorisedMethods.includes("exportPlanningUnitGrid") ? null : (
        <Button
          startIcon={<ExportIcon style={{ height: "20px", width: "20px" }} />}
          title="Export planning grid"
          onClick={props.exportPlanningGrid}
          disabled={!props.selectedPlanningGrid || props.loading}
        >
          Export
        </Button>
      )}
      {props.unauthorisedMethods.includes("deletePlanningUnitGrid") ? null : (
        <Button
          startIcon={
            <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
          }
          title="Delete planning grid"
          disabled={
            !props.selectedPlanningGrid ||
            props.loading ||
            (props.selectedPlanningGrid &&
              props.selectedPlanningGrid.created_by === "global admin")
          }
          onClick={props.handleDelete}
        >
          Delete
        </Button>
      )}
    </ButtonGroup>
  );
};

export default PlanningGridsToolbar;

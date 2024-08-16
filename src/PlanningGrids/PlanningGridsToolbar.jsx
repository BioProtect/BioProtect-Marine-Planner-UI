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
    <div
      style={{
        display: props.userRole === "ReadOnly" ? "none" : "block",
      }}
    >
      <ButtonGroup aria-label="Basic button group" fullWidth="true">
        <Button
          show={!props.unauthorisedMethods.includes("createPlanningUnitGrid")}
          startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
          title="New planning grid"
          onClick={props.handleNew}
        >
          New
        </Button>

        <Button
          show={
            !props.unauthorisedMethods.includes("createMarinePlanningUnitGrid")
          }
          startIcon={<FontAwesomeIcon icon={faFileCode} />}
          title="Import from simple Shapefile"
          onClick={props.handleNewMarine}
        >
          Import Shapefile
        </Button>

        <Button
          show={!props.unauthorisedMethods.includes("importPlanningUnitGrid")}
          startIcon={<ImportIcon style={{ height: "20px", width: "20px" }} />}
          title="Import an existing planning grid from the local machine"
          onClick={props.openImportDialog}
        >
          Import Planning Grid
        </Button>

        <Button
          show={!props.unauthorisedMethods.includes("exportPlanningUnitGrid")}
          startIcon={<ExportIcon style={{ height: "20px", width: "20px" }} />}
          title="Export planning grid"
          onClick={props.exportPlanningGrid}
          disabled={!props.selectedPlanningGrid || props.loading}
        >
          Export
        </Button>
        <Button
          show={!props.unauthorisedMethods.includes("deletePlanningUnitGrid")}
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
      </ButtonGroup>
    </div>
  );
};

export default PlanningGridsToolbar;

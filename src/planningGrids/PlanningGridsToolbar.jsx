import AddCircleIcon from "@mui/icons-material/AddCircle";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import DeleteIcon from "@mui/icons-material/Delete";
import ExportIcon from "@mui/icons-material/Publish";
import ImportIcon from "@mui/icons-material/GetApp";
import React from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const PlanningGridsToolbar = (props) => {
  return (
    <ButtonGroup aria-label="Basic button group">
      <Button
        startIcon={<AddCircleIcon />}
        title="New planning grid"
        onClick={props.handleNew}
      >
        New
      </Button>
      <Button
        startIcon={<UploadFileIcon />}
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
          startIcon={<DeleteIcon />}
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

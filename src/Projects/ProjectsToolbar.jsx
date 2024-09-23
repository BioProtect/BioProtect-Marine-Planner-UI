import React, { useState } from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Export from "@mui/icons-material/Publish";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const ProjectsToolbar = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const style = (method) => {
    display: !props.unauthorisedMethods.includes(method)
      ? "inline-block"
      : "none";
  };

  return (
    <div
      style={{
        display: props.userRole === "ReadOnly" ? "none" : "block",
      }}
    >
      <ButtonGroup aria-label="Basic button group" fullWidth={true}>
        <Button
          show={!props.unauthorisedMethods.includes("createProject")}
          startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
          title="New project"
          onClick={props.handleNew}
        >
          New
        </Button>

        <Button
          show={!(props.userRole === "ReadOnly")}
          title="Import a project from Marxan Web or Marxan DOS"
          disabled={props.loading}
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          Import
        </Button>

        <Menu
          desktop={true}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
        >
          <MenuItem
            style={style("importProject")}
            onClick={props.openImportMXWDialog}
          >
            Import a project from a Marxan Web *.mxw file
          </MenuItem>
          <MenuItem
            style={style("createImportProject")}
            onClick={props.openImportProjectDialog}
          >
            Import a project from Marxan DOS
          </MenuItem>
        </Menu>

        <Button
          show={!props.unauthorisedMethods.includes("exportProject")}
          startIcon={<Export style={{ height: "20px", width: "20px" }} />}
          title="Export project"
          onClick={props.exportProject}
          disabled={
            !props.selectedProject ||
            props.loading ||
            props.selectedProject.oldVersion
          }
        >
          Export
        </Button>

        <Button
          show={!props.unauthorisedMethods.includes("cloneProject")}
          startIcon={<FileCopyIcon style={{ height: "20px", width: "20px" }} />}
          title="Clone project"
          onClick={props.cloneProject}
          disabled={!props.selectedProject || props.loading}
        >
          Clone
        </Button>
        <Button
          show={!props.unauthorisedMethods.includes("deleteProject")}
          startIcon={
            <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
          }
          title="Delete project"
          disabled={!props.selectedProject || props.loading}
          onClick={props.handleDelete}
        >
          Delete
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default ProjectsToolbar;

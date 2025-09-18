import React, { useCallback, useState } from "react";

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
import { toggleProjDialog } from "@slices/projectSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const ProjectsToolbar = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const newProject = useCallback(() => {
    dispatch(
      toggleProjDialog({ dialogName: "newProjectDialogOpen", isOpen: true })
    );
  }, []);


  const style = (method) => {
    display: props.unauthorisedMethods.includes(method) ? "none" : "inline-block";
  };

  return (
    <div
      style={{
        display: props.userRole === "ReadOnly" ? "none" : "block",
      }}
    >
      <ButtonGroup aria-label="Basic button group" fullWidth={true}>
        <Button
          startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
          title="New project"
          onClick={() => newProject()}
        >
          New
        </Button>

        {props.unauthorisedMethods.includes("exportProject") ? null : (
          <Button
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
        )}
        {props.unauthorisedMethods.includes("cloneProject") ? null : (
          <Button
            startIcon={
              <FileCopyIcon style={{ height: "20px", width: "20px" }} />
            }
            title="Clone project"
            onClick={props.cloneProject}
            disabled={!props.selectedProject || props.loading}
          >
            Clone
          </Button>
        )}
        {props.unauthorisedMethods.includes("deleteProject") ? null : (
          <Button
            startIcon={
              <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
            }
            title="Delete project"
            disabled={!props.selectedProject || props.loading}
            onClick={props.handleDelete}
          >
            Delete
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
};

export default ProjectsToolbar;

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Export from "@mui/icons-material/Publish";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import ToolbarButton from "../ToolbarButton";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const ProjectsToolbar = (props) => {
  return (
    <div
      style={{
        display: props.userRole === "ReadOnly" ? "none" : "block",
      }}
    >
      <ButtonGroup aria-label="Basic button group" fullWidth="true">
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
          onClick={props.showImportProjectPopover}
          disabled={props.loading}
        >
          Import
        </Button>

        <Popover
          open={props.importProjectPopoverOpen}
          anchorEl={props.importProjectAnchor}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          targetOrigin={{ horizontal: "left", vertical: "top" }}
          onClose={() => props.updateState({ importProjectPopoverOpen: false })}
        >
          <Menu desktop={true}>
            <MenuItem
              style={{
                display: !props.unauthorisedMethods.includes("importProject")
                  ? "inline-block"
                  : "none",
              }}
              primaryText="From Marxan Web"
              title="Import a project from a Marxan Web *.mxw file"
              onClick={props.openImportMXWDialog}
            />
            <MenuItem
              style={{
                display: !props.unauthorisedMethods.includes(
                  "createImportProject"
                )
                  ? "inline-block"
                  : "none",
              }}
              primaryText="From Marxan DOS"
              title="Import a project from a Marxan DOS"
              onClick={props.openImportProjectDialog}
            />
          </Menu>
        </Popover>

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

/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useCallback, useState } from "react";

import Button from "@mui/material/Button";
import Export from "@mui/icons-material/Publish";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import MarxanDialog from "../MarxanDialog";
import MarxanTable from "../MarxanTable";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import ToolbarButton from "../ToolbarButton";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const ProjectsDialog = (props) => {
  const [searchText, setSearchText] = useState("");
  const [selectedProject, setSelectedProject] = useState(undefined);
  const [importProjectAnchor, setImportProjectAnchor] = useState(null);

  const _delete = useCallback(() => {
    props.deleteProject(selectedProject.user, selectedProject.name);
    setSelectedProject(undefined);
  }, [props, selectedProject]);

  const load = useCallback(() => {
    if (props.oldVersion && selectedProject.oldVersion === false) {
      props.getAllFeatures().then(() => {
        loadAndClose();
      });
    } else {
      loadAndClose();
    }
  }, [props, selectedProject]);

  const loadAndClose = useCallback(() => {
    props.loadProject(selectedProject.name, selectedProject.user);
    closeDialog();
  }, [props, selectedProject]);

  const showImportProjectPopover = useCallback(
    (event) => {
      setImportProjectAnchor(event.currentTarget);
      props.updateState({ importProjectPopoverOpen: true });
    },
    [props]
  );

  const _new = useCallback(() => {
    props.getAllFeatures().then(() => {
      props.updateState({ newProjectDialogOpen: true });
      closeDialog();
    });
  }, [props]);

  const cloneProject = useCallback(() => {
    props.cloneProject(selectedProject.user, selectedProject.name);
  }, [props, selectedProject]);

  const exportProject = useCallback(() => {
    props
      .exportProject(selectedProject.user, selectedProject.name)
      .then((url) => {
        window.location = url;
      });
    closeDialog();
  }, [props, selectedProject]);

  const openImportProjectDialog = useCallback(() => {
    props.updateState({ importProjectDialogOpen: true });
    closeDialog();
  }, [props]);

  const openImportMXWDialog = useCallback(() => {
    props.updateState({ importMXWDialogOpen: true });
    closeDialog();
  }, [props]);

  const changeProject = useCallback((event, project) => {
    setSelectedProject(project);
  }, []);

  const closeDialog = useCallback(() => {
    setSelectedProject(undefined);
    props.updateState({
      projectsDialogOpen: false,
      importProjectPopoverOpen: false,
    });
  }, [props]);
  const sortDate = useCallback((a, b, desc) => {
    return new Date(
      a.slice(6, 8),
      a.slice(3, 5) - 1,
      a.slice(0, 2),
      a.slice(9, 11),
      a.slice(12, 14),
      a.slice(15, 17)
    ) >
      new Date(
        b.slice(6, 8),
        b.slice(3, 5) - 1,
        b.slice(0, 2),
        b.slice(9, 11),
        b.slice(12, 14),
        b.slice(15, 17)
      )
      ? 1
      : -1;
  }, []);

  const renderDate = useCallback((row) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
        title={row.original.createdate}
      >
        {row.original.createdate.substr(0, 8)}
      </div>
    );
  }, []);

  const renderTitle = useCallback((row) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          // backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
        title={row.original.description}
      >
        {row.original.description}
      </div>
    );
  }, []);

  const renderName = useCallback((row) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          // backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
        title={row.original.name}
      >
        {row.original.name}
      </div>
    );
  }, []);

  const searchTextChanged = useCallback((value) => {
    setSearchText(value);
  }, []);

  let tableColumns = [];
  if (["Admin", "ReadOnly"].includes(props.userRole)) {
    tableColumns = [
      {
        Header: "User",
        accessor: "user",
        width: 90,
        headerStyle: { textAlign: "left" },
      },
      {
        Header: "Name",
        accessor: "name",
        width: 200,
        headerStyle: { textAlign: "left" },
        Cell: renderName,
      },
      {
        Header: "Description",
        accessor: "description",
        width: 360,
        headerStyle: { textAlign: "left" },
        Cell: renderTitle,
      },
      {
        Header: "Created",
        accessor: "createdate",
        width: 70,
        headerStyle: { textAlign: "left" },
        Cell: renderDate,
        sortMethod: sortDate,
      },
    ];
  } else {
    tableColumns = [
      {
        Header: "Name",
        accessor: "name",
        width: 260,
        headerStyle: { textAlign: "left" },
        Cell: renderName,
      },
      {
        Header: "Description",
        accessor: "description",
        width: 390,
        headerStyle: { textAlign: "left" },
        Cell: renderTitle,
      },
      {
        Header: "Created",
        accessor: "createdate",
        width: 220,
        headerStyle: { textAlign: "left" },
        Cell: renderDate,
        sortMethod: sortDate,
      },
    ];
  }
  if (props.projects) {
    return (
      <MarxanDialog
        {...props}
        okLabel={props.userRole === "ReadOnly" ? "Open (Read-only)" : "Open"}
        onOk={load}
        onCancel={closeDialog}
        okDisabled={!selectedProject}
        showCancelButton={true}
        helpLink={"user.html#the-projects-window"}
        autoDetectWindowHeight={false}
        bodyStyle={{ padding: "0px 24px 0px 24px" }}
        title="Projects"
        showSearchBox={true}
        searchTextChanged={searchTextChanged}
      >
        <React.Fragment key="k2">
          <div id="projectsTable">
            <MarxanTable
              data={props.projects}
              columns={tableColumns}
              searchColumns={["user", "name", "description"]}
              searchText={searchText}
              selectedProject={selectedProject}
              changeProject={changeProject}
              getTrProps={(state, rowInfo, column) => {
                return {
                  style: {
                    background:
                      rowInfo.original.user ===
                        (state.selectedProject && state.selectedProject.user) &&
                      rowInfo.original.name ===
                        (state.selectedProject && state.selectedProject.name)
                        ? "aliceblue"
                        : "",
                  },
                  onClick: (e) => {
                    state.changeProject(e, rowInfo.original);
                  },
                };
              }}
            />
          </div>
          <div
            id="projectsToolbar"
            style={{
              display: props.userRole === "ReadOnly" ? "none" : "block",
            }}
          >
            <Button
              show={!props.unauthorisedMethods.includes("createProject")}
              startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
              title="New project"
              onClick={_new}
            >
              New
            </Button>
            <Button
              show={!(props.userRole === "ReadOnly")}
              title="Import a project from Marxan Web or Marxan DOS"
              onClick={showImportProjectPopover}
              disabled={props.loading}
            >
              Import
            </Button>
            <Popover
              open={props.importProjectPopoverOpen}
              anchorEl={importProjectAnchor}
              anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
              onClose={() =>
                props.updateState({ importProjectPopoverOpen: false })
              }
            >
              <Menu desktop={true}>
                <MenuItem
                  style={{
                    display: !props.unauthorisedMethods.includes(
                      "importProject"
                    )
                      ? "inline-block"
                      : "none",
                  }}
                  primaryText="From Marxan Web"
                  title="Import a project from a Marxan Web *.mxw file"
                  onClick={openImportMXWDialog}
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
                  onClick={openImportProjectDialog}
                />
              </Menu>
            </Popover>
            <Button
              show={!props.unauthorisedMethods.includes("exportProject")}
              startIcon={<Export style={{ height: "20px", width: "20px" }} />}
              title="Export project"
              onClick={exportProject}
              disabled={
                !selectedProject || props.loading || selectedProject.oldVersion
              }
            >
              Export
            </Button>
            <Button
              show={!props.unauthorisedMethods.includes("cloneProject")}
              startIcon={
                <FileCopyIcon style={{ height: "20px", width: "20px" }} />
              }
              title="Clone project"
              onClick={cloneProject}
              disabled={!selectedProject || props.loading}
            >
              Clone
            </Button>
            <Button
              show={!props.unauthorisedMethods.includes("deleteProject")}
              startIcon={
                <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
              }
              title="Delete project"
              disabled={!selectedProject || props.loading}
              onClick={_delete}
            >
              Delete
            </Button>
          </div>
        </React.Fragment>
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default ProjectsDialog;

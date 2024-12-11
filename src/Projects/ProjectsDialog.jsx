/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import ProjectsToolbar from "./ProjectsToolbar";
import { generateTableCols } from "../Helpers";
import { toggleProjectDialog } from "../slices/uiSlice";

const ProjectsDialog = (props) => {
  const dispatch = useDispatch();
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );

  const _delete = useCallback(() => {
    props.deleteProject(props.project.user, props.project.name);
  }, [props.project]);

  const load = useCallback(() => {
    loadAndClose();
  }, []);

  const loadAndClose = useCallback(() => {
    props.loadProject(props.project.name, props.project.user);
    dispatch(
      toggleProjectDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [props.project]);

  const _new = useCallback(() => {
    dispatch(
      toggleProjectDialog({ dialogName: "newProjectDialogOpen", isOpen: true })
    );
    dispatch(
      toggleProjectDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, []);

  const cloneProject = useCallback(() => {
    props.cloneProject(props.project.user, props.project.name);
  }, [props]);

  const exportProject = useCallback(() => {
    props.exportProject(props.project.user, props.project.name).then((url) => {
      window.location = url;
    });
    dispatch(
      toggleProjectDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [props]);

  const openImportProjectDialog = useCallback(() => {
    props.setImportProjectDialogOpen(true);
    dispatch(
      toggleProjectDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [props.setImportProjectDialogOpen]);

  const openImportMXWDialog = useCallback(() => {
    props.setImportMXWDialogOpen(true);
    dispatch(
      toggleProjectDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [props.setImportMXWDialogOpen]);

  // const changeProject = useCallback((event, project) => {
  //   setSelectedProject(project);
  // }, []);

  const handleProjectChange = (e) => {
    console.log("e ", e);
  };

  const sortDate = useCallback((a, b, desc) => {
    const dateA = new Date(a.split("/").reverse().join(" "));
    const dateB = new Date(b.split("/").reverse().join(" "));

    if (dateA > dateB) return desc ? -1 : 1;
    if (dateA < dateB) return desc ? 1 : -1;
    return 0;
  }, []);

  const baseColumns = [
    { id: "name", label: "name" },
    { id: "description", label: "description" },
    { id: "created", label: "createdate" },
  ];

  const tableColumns = ["Admin", "ReadOnly"].includes(props.userRole)
    ? [...baseColumns, { id: "user", label: "user" }]
    : baseColumns;

  const columns = generateTableCols(tableColumns);

  if (props.projects) {
    return (
      <MarxanDialog
        open={projectDialogStates.projectsDialogOpen}
        loading={props.loading}
        okLabel={props.userRole === "ReadOnly" ? "Open (Read-only)" : "Open"}
        onOk={load}
        onCancel={() =>
          dispatch(
            toggleProjectDialog({
              dialogName: "projectsDialogOpen",
              isOpen: false,
            })
          )
        }
        okDisabled={!props.project}
        showCancelButton={true}
        helpLink={"user.html#the-projects-window"}
        autoDetectWindowHeight={false}
        title="Projects"
        actions={
          <ProjectsToolbar
            userRole={props.userRole}
            unauthorisedMethods={props.unauthorisedMethods}
            handleNew={() => _new()}
            loading={props.loading}
            importProjectPopoverOpen={props.importProjectPopoverOpen}
            openImportMXWDialog={openImportMXWDialog}
            openImportProjectDialog={openImportProjectDialog}
            exportProject={exportProject}
            project={props.project}
            cloneProject={cloneProject}
            handleDelete={() => _delete()}
          />
        }
      >
        <div id="projectsTable">
          <BioprotectTable
            title="Projects"
            data={props.projects}
            tableColumns={columns}
            selected={[props.project]}
            ableToSelectAll={false}
            showSearchBox={true}
            searchColumns={["user", "name", "description"]}
            updateSelection={handleProjectChange}
          />
        </div>
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default ProjectsDialog;

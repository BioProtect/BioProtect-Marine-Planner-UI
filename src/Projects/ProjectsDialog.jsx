/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useCallback, useState } from "react";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import ProjectsToolbar from "./ProjectsToolbar";
import { generateTableCols } from "../Helpers";

const ProjectsDialog = (props) => {
  const _delete = useCallback(() => {
    props.deleteProject(props.project.user, props.project.name);
  }, [props.project]);

  const load = useCallback(() => {
    loadAndClose();
  }, []);

  const loadAndClose = useCallback(() => {
    props.loadProject(props.project.name, props.project.user);
    closeDialog();
  }, [props.project]);

  const _new = useCallback(() => {
    props.setNewProjectDialogOpen(true);
    closeDialog();
  }, [props]);

  const cloneProject = useCallback(() => {
    props.cloneProject(props.project.user, props.project.name);
  }, [props]);

  const exportProject = useCallback(() => {
    props.exportProject(props.project.user, props.project.name).then((url) => {
      window.location = url;
    });
    closeDialog();
  }, [props]);

  const openImportProjectDialog = useCallback(() => {
    props.updateState({ importProjectDialogOpen: true });
    closeDialog();
  }, [props.updateState]);

  const openImportMXWDialog = useCallback(() => {
    props.setImportMXWDialogOpen(true);
    closeDialog();
  }, [props.setImportMXWDialogOpen]);

  // const changeProject = useCallback((event, project) => {
  //   setSelectedProject(project);
  // }, []);

  const closeDialog = useCallback(() => {
    // setSelectedProject(undefined);
    props.updateState({
      projectsDialogOpen: false,
      selectedProject: undefined,
      // importProjectPopoverOpen: false,
    });
  }, [props]);

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
        {...props}
        okLabel={props.userRole === "ReadOnly" ? "Open (Read-only)" : "Open"}
        onOk={load}
        onCancel={closeDialog}
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
            updateState={() => props.updateState()}
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

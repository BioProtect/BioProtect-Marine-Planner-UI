import React, { useCallback, useState } from "react";
import { setActiveTab, toggleDialog } from "../slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import ProjectsToolbar from "./ProjectsToolbar";
import { generateTableCols } from "../Helpers";
import { toggleProjDialog } from "../slices/projectSlice";

const ProjectsDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projState = useSelector((state) => state.project);

  const _delete = useCallback(() => {
    props.deleteProject(projState.project.user, projState.project.name);
  }, [projState.project]);

  const load = useCallback(() => {
    loadAndClose();
  }, []);

  const loadAndClose = useCallback(() => {
    props.loadProject(projState.project.name, projState.project.user);
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [projState.project]);

  const _new = useCallback(() => {
    dispatch(
      toggleProjDialog({ dialogName: "newProjectDialogOpen", isOpen: true })
    );
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, []);

  const cloneProject = useCallback(() => {
    props.cloneProject(projState.project.user, projState.project.name);
  }, [props]);

  const exportProject = useCallback(() => {
    props.exportProject(projState.project.user, projState.project.name).then((url) => {
      window.location = url;
    });
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [props]);

  const openImportProjectDialog = useCallback(() => {
    props.setImportProjectDialogOpen(true);
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [props.setImportProjectDialogOpen]);

  const openImportMXWDialog = useCallback(() => {
    props.setImportMXWDialogOpen(true);
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
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

    if (dateA > dateB) {
      return desc ? -1 : 1;
    } else if (dateA < dateB) {
      return desc ? 1 : -1;
    } else {
      return 0;
    }
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

  if (projState.projects) {
    return (
      <MarxanDialog
        open={projState.dialogs.projectsDialogOpen}
        loading={props.loading}
        okLabel={props.userRole === "ReadOnly" ? "Open (Read-only)" : "Open"}
        onOk={load}
        onCancel={() =>
          dispatch(
            toggleProjDialog({
              dialogName: "projectsDialogOpen",
              isOpen: false,
            })
          )
        }
        okDisabled={!projState.project}
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
            cloneProject={cloneProject}
            handleDelete={() => _delete()}
          />
        }
      >
        <div id="projectsTable">
          <BioprotectTable
            title="Projects"
            data={projState.projects}
            tableColumns={columns}
            selected={[projState.project]}
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

import React, { useCallback, useState } from "react";
import { setActiveTab, toggleDialog } from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import ProjectsToolbar from "./ProjectsToolbar";
import { generateTableCols } from "../Helpers";
import { toggleProjDialog } from "@slices/projectSlice";

const ProjectsDialog = ({
  loading, oldVersion, deleteProject, loadProject, cloneProject, exportProject, userRole, unauthorisedMethods
}) => {
  const dispatch = useDispatch();
  const projState = useSelector((state) => state.project);

  const handleDeleteProject = useCallback(() => {
    deleteProject(projState.project.user, projState.project.name);
  }, [projState.project]);

  const loadAndClose = useCallback(() => {
    loadProject(projState.project.name, projState.project.user);
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [projState.project]);

  const handleCloneProject = useCallback(() => {
    cloneProject(projState.project.user, projState.project.name);
  }, [cloneProject]);

  const handleExportProject = useCallback(() => {
    exportProject(projState.project.user, projState.project.name).then((url) => {
      window.location = url;
    });
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [projState.project]);

  // const changeProject = useCallback((event, project) => {
  //   setSelectedProject(project);
  // }, []);

  const handleProjectChange = (event, row) => {
    console.log("handle project change = event, row ", event, row);
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
    { id: "createdate", label: "created date" },
  ];

  const tableColumns = ["Admin", "ReadOnly"].includes(userRole)
    ? [...baseColumns, { id: "user_id", label: "user_id" }]
    : baseColumns;

  const columns = generateTableCols(tableColumns);

  const closeDialog = () => {
    dispatch(toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false }));
  }

  if (projState.projects) {
    return (
      <MarxanDialog
        open={projState.dialogs.projectsDialogOpen}
        loading={loading}
        okLabel={userRole === "ReadOnly" ? "Open (Read-only)" : "Open"}
        onOk={loadAndClose}
        onCancel={() => closeDialog()}
        okDisabled={!projState.project}
        showCancelButton={true}
        autoDetectWindowHeight={false}
        title="Projects"
        actions={
          <ProjectsToolbar
            userRole={userRole}
            unauthorisedMethods={unauthorisedMethods}
            loading={loading}
            exportProject={handleExportProject}
            cloneProject={handleCloneProject}
            handleDelete={() => handleDeleteProject()}
          />
        }
      >
        <div id="projectsTable">
          <BioprotectTable
            title="Projects"
            data={projState.projects}
            tableColumns={columns}
            selected={[projState.projectData.project]}
            ableToSelectAll={false}
            showSearchBox={true}
            searchColumns={["user", "name", "description"]}
            clickRow={handleProjectChange}
            isProject={true}
          />
        </div>
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default ProjectsDialog;

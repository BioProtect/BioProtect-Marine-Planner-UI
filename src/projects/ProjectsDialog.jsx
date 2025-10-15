import React, { useCallback, useState } from "react";
import { setActiveTab, toggleDialog } from "@slices/uiSlice";
import { switchProject, toggleProjDialog } from "@slices/projectSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import ProjectsToolbar from "./ProjectsToolbar";
import { generateTableCols } from "../Helpers";

const ProjectsDialog = ({
  loading, oldVersion, deleteProject, loadProject, cloneProject, exportProject, userRole, unauthorisedMethods, loadProjectAndSetup
}) => {
  const dispatch = useDispatch();
  const projState = useSelector((state) => state.project);
  const [selectedProjectId, setSelectedProjectId] = useState(projState.projectData.project)


  const handleDeleteProject = useCallback(() => {
    deleteProject(projState.projectData.user, projState.projectData.name);
  }, [projState.projectData]);

  const loadAndClose = useCallback(async () => {
    try {
      dispatch(toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false }));
      await loadProjectAndSetup(selectedProjectId);
    } catch (error) {
      showMessage("Failed to load project", "error");
    }
  }, [dispatch, selectedProjectId]);

  const handleCloneProject = useCallback(() => {
    cloneProject(projState.projectData.user, projState.projectData.name);
  }, [cloneProject]);

  const handleExportProject = useCallback(() => {
    exportProject(projState.projectData.user, projState.projectData.name).then((url) => {
      window.location = url;
    });
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false })
    );
  }, [projState.projectData]);


  const handleProjectChange = (event, row) => {
    const projectId = row?.id;
    console.log("projectId in handleProjectChange  ", projectId);
    if (!projectId) {
      console.warn("Invalid project selected");
      return;
    }
    setSelectedProjectId(projectId)
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
        okDisabled={!projState.projectData}
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
            selected={[selectedProjectId]}
            ableToSelectAll={false}
            showSearchBox={true}
            searchColumns={["user", "name", "description"]}
            clickRow={handleProjectChange}
            isProject={true}
            preview={false}
          />
        </div>
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default ProjectsDialog;

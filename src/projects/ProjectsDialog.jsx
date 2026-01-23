import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import ProjectsToolbar from "./ProjectsToolbar";
import { generateTableCols } from "../Helpers";
import { selectCurrentUserId } from "@slices/authSlice";
import { toggleProjDialog } from "@slices/projectSlice";
import { useListProjectsQuery } from "@slices/projectSlice";

const ProjectsDialog = ({
  loading,
  oldVersion,
  deleteProject,
  loadProject,
  cloneProject,
  exportProject,
  userRole,
  unauthorisedMethods,
  loadProjectAndSetup,
}) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);

  const projDialogs = useSelector((state) => state.project.dialogs);

  const { data: projectsResp = {}, isFetching } = useListProjectsQuery(userId, {
    skip: !userId,
  });
  console.log("projectsResp ", projectsResp);
  const projects = projectsResp.projects ?? [];
  const activeProjectId = useSelector((state) => state.project.activeProjectId);
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId);
  const project = projects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    setSelectedProjectId(activeProjectId);
  }, [activeProjectId]);

  const loadAndClose = useCallback(async () => {
    try {
      dispatch(
        toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false }),
      );
      await loadProjectAndSetup(selectedProjectId);
    } catch (error) {
      showMessage("Failed to load project", "error");
    }
  }, [dispatch, selectedProjectId]);

  const handleDeleteProject = useCallback(() => {
    if (!project) return;
    deleteProject(project.user, project.name);
  }, [project]);

  const handleCloneProject = useCallback(() => {
    if (!project) return;
    cloneProject(project.user, project.name);
  }, [project]);

  const handleExportProject = useCallback(() => {
    if (!project) return;
    exportProject(project.user, project.name).then((url) => {
      window.location = url;
    });
  }, [project]);

  const handleProjectChange = (event, row) => {
    const projectId = row?.id;
    console.log("projectId in handleProjectChange  ", projectId);
    if (!projectId) {
      console.warn("Invalid project selected");
      return;
    }
    setSelectedProjectId(projectId);
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
    dispatch(
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: false }),
    );
  };

  if (projects) {
    return (
      <MarxanDialog
        open={projDialogs.projectsDialogOpen}
        loading={loading}
        okLabel={userRole === "ReadOnly" ? "Open (Read-only)" : "Open"}
        onOk={loadAndClose}
        onCancel={() => closeDialog()}
        okDisabled={!project}
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
            data={projects}
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

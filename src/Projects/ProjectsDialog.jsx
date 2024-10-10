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
  const [searchText, setSearchText] = useState("");
  const [selectedProject, setSelectedProject] = useState(
    props.project || undefined
  );

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
      // importProjectPopoverOpen: false,
    });
  }, [props]);

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
        okDisabled={!selectedProject}
        showCancelButton={true}
        helpLink={"user.html#the-projects-window"}
        autoDetectWindowHeight={false}
        bodyStyle={{ padding: "0px 24px 0px 24px" }}
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
            selectedProject={selectedProject}
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
            initialSelection={selectedProject}
            ableToSelectAll={false}
            showSearchBox={true}
            searchColumns={["user", "name", "description"]}
          />
        </div>
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default ProjectsDialog;

import { selectCurrentUserId } from '@slices/authSlice'
import { toggleProjDialog, useListProjectsQuery } from '@slices/projectSlice'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BioprotectTable from '../BPComponents/BioprotectTable'
import ConfirmDeleteDialog from '../BPComponents/ConfirmDeleteDialog'
import BPDialog from '../BPDialog'
import { resolutionLabel } from '../bpVars.jsx'
import { generateTableCols } from '../Helpers'
import ProjectsToolbar from './ProjectsToolbar'

function ProjectsDialog({ loading, deleteProject, cloneProject, exportProject, userRole, unauthorisedMethods, loadProjectAndSetup }) {
  const dispatch = useDispatch()
  const userId = useSelector(selectCurrentUserId)

  const projDialogs = useSelector(state => state.project.dialogs)

  const { data: projectsResp = {} } = useListProjectsQuery(userId, {
    skip: !userId,
  })
  const projects = useMemo(
    () =>
      (projectsResp.projects ?? []).map(p => ({
        ...p,
        resolution: resolutionLabel(p.resolution),
      })),
    [projectsResp.projects],
  )
  const activeProjectId = useSelector(state => state.project.activeProjectId)
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId)
  const project = projects.find(p => p.id === selectedProjectId)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    setSelectedProjectId(activeProjectId)
  }, [activeProjectId])

  const loadAndClose = useCallback(async () => {
    try {
      dispatch(
        toggleProjDialog({ dialogName: 'projectsDialogOpen', isOpen: false }),
      )
      await loadProjectAndSetup(selectedProjectId)
    }
    catch {
      showMessage('Failed to load project', 'error')
    }
  }, [dispatch, selectedProjectId])

  const handleDeleteProject = useCallback(() => {
    if (!project)
      return
    setConfirmDeleteOpen(false)
    deleteProject(project.id)
  }, [project])

  const handleCloneProject = useCallback(() => {
    if (!project)
      return
    cloneProject(project.user, project.name)
  }, [project])

  const handleExportProject = useCallback(() => {
    if (!project)
      return
    exportProject(project.user, project.name).then((url) => {
      window.location = url
    })
  }, [project])

  const handleProjectChange = (event, row) => {
    const projectId = row?.id
    if (!projectId) {
      console.warn('Invalid project selected')
      return
    }
    setSelectedProjectId(projectId)
  }

  const baseColumns = [
    { id: 'name', label: 'name' },
    { id: 'description', label: 'description' },
    { id: 'createdate', label: 'created date' },
    { id: 'resolution', label: 'resolution' },
  ]

  const tableColumns = ['Admin', 'ReadOnly'].includes(userRole)
    ? [
        ...baseColumns,
        { id: 'user_id', label: 'user_id' },
      ]
    : baseColumns

  const columns = generateTableCols(tableColumns)

  const closeDialog = () => {
    dispatch(
      toggleProjDialog({ dialogName: 'projectsDialogOpen', isOpen: false }),
    )
  }

  if (projects) {
    return (
      <BPDialog
        open={projDialogs.projectsDialogOpen}
        loading={loading}
        okLabel={userRole === 'ReadOnly'
          ? 'Open (Read-only)'
          : 'Open'}
        onOk={loadAndClose}
        onCancel={() => closeDialog()}
        okDisabled={!project}
        showCancelButton={true}
        autoDetectWindowHeight={false}
        title="Projects"
        actions={(
          <ProjectsToolbar
            userRole={userRole}
            unauthorisedMethods={unauthorisedMethods}
            loading={loading}
            exportProject={handleExportProject}
            cloneProject={handleCloneProject}
            handleDelete={() => setConfirmDeleteOpen(true)}
            canDelete={project?.role === 'owner'}
          />
        )}
      >
        <div id="projectsTable">
          <BioprotectTable
            title="Projects"
            data={projects}
            tableColumns={columns}
            selected={[selectedProjectId]}
            ableToSelectAll={false}
            showSearchBox={true}
            searchColumns={['user', 'name', 'description']}
            clickRow={handleProjectChange}
            isProject={true}
            preview={false}
          />
        </div>
        <ConfirmDeleteDialog
          open={confirmDeleteOpen && !!project}
          title="Delete project?"
          onCancel={() => setConfirmDeleteOpen(false)}
          onConfirm={handleDeleteProject}
        >
          <p>Are you sure you want to delete the project</p>
          <b>
            {project?.name}
            ?
          </b>
          <p>
            This removes its planning units, cost profiles, runs and results,
            and cannot be undone. Features and planning grids are not deleted.
          </p>
        </ConfirmDeleteDialog>
      </BPDialog>
    )
  }
  else {
    return null
  }
}

export default ProjectsDialog

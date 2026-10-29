import AddCircleIcon from '@mui/icons-material/AddCircle'

import DeleteIcon from '@mui/icons-material/Delete'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import Export from '@mui/icons-material/Publish'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { toggleProjDialog } from '@slices/projectSlice'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

function ProjectsToolbar(props) {
  const dispatch = useDispatch()

  const newProject = useCallback(() => {
    dispatch(
      toggleProjDialog({ dialogName: 'newProjectDialogOpen', isOpen: true }),
    )
  }, [])

  return (
    <div
      style={{
        display: props.userRole === 'ReadOnly'
          ? 'none'
          : 'block',
      }}
    >
      <ButtonGroup aria-label="Basic button group" fullWidth={true}>
        <Button
          startIcon={<AddCircleIcon />}
          title="New project"
          onClick={() => newProject()}
        >
          New
        </Button>

        {props.unauthorisedMethods.includes('exportProject')
          ? null
          : (
              <Button
                startIcon={<Export style={{ height: '20px', width: '20px' }} />}
                title="Export project"
                onClick={props.exportProject}
                disabled={
                  !props.selectedProject
                  || props.loading
                  || props.selectedProject.oldVersion
                }
              >
                Export
              </Button>
            )}
        {props.unauthorisedMethods.includes('cloneProject')
          ? null
          : (
              <Button
                startIcon={
                  <FileCopyIcon style={{ height: '20px', width: '20px' }} />
                }
                title="Clone project"
                onClick={props.cloneProject}
                disabled={!props.selectedProject || props.loading}
              >
                Clone
              </Button>
            )}
        {props.unauthorisedMethods.includes('deleteProject')
          ? null
          : (
              <Button
                startIcon={<DeleteIcon style={{ height: '20px', width: '20px' }} />}
                title="Delete project"
                disabled={!props.canDelete || props.loading}
                onClick={props.handleDelete}
              >
                Delete
              </Button>
            )}
      </ButtonGroup>
    </div>
  )
}

export default ProjectsToolbar

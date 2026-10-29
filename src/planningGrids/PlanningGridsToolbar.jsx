import DeleteIcon from '@mui/icons-material/Delete'
import ExportIcon from '@mui/icons-material/Publish'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

function PlanningGridsToolbar(props) {
  return (
    <ButtonGroup aria-label="Basic button group">
      {props.unauthorisedMethods.includes('exportPlanningUnitGrid')
        ? null
        : (
            <Button
              startIcon={<ExportIcon style={{ height: '20px', width: '20px' }} />}
              title="Export planning grid"
              onClick={props.exportPlanningGrid}
              disabled={!props.selectedPlanningGrid || props.loading}
            >
              Export
            </Button>
          )}
      {props.unauthorisedMethods.includes('deletePlanningUnitGrid')
        ? null
        : (
            <Button
              startIcon={<DeleteIcon />}
              title="Delete planning grid"
              disabled={!props.canDelete || props.loading}
              onClick={props.handleDelete}
            >
              Delete
            </Button>
          )}
    </ButtonGroup>
  )
}

export default PlanningGridsToolbar

import CheckBoxIcon from '@mui/icons-material/CheckBox'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import Import from '@mui/icons-material/GetApp'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { setSelectedFeatureIds, toggleFeatureD } from '@slices/featureSlice'
import { useDispatch, useSelector } from 'react-redux'

function FeaturesToolbar({ selectAllFeatures, canChoose }) {
  const dispatch = useDispatch()
  const uiState = useSelector(state => state.ui)
  // Import reads shapefiles without a .prj in the open project's CRS, which is
  // the wrong one for a project that doesn't exist yet.
  const forNewProject = useSelector(
    state => state.project.dialogs.newProjectDialogOpen,
  )

  // Opens on top, like preview: closing this one would lose the Cancel snapshot.
  const handleOpenImportFeaturesDialog = () => {
    dispatch(
      toggleFeatureD({ dialogName: 'importFeaturesDialogOpen', isOpen: true }),
    )
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pb: 1 }}>
      <div>
        {!forNewProject && (
          <Button
            variant="contained"
            startIcon={<Import />}
            title="Add features to the library from a shapefile"
            disabled={uiState.loading}
            onClick={handleOpenImportFeaturesDialog}
          >
            Import shapefile
          </Button>
        )}
      </div>
      {canChoose
        ? (
            <ButtonGroup aria-label="Batch feature controls">
              <Button
                startIcon={<CheckBoxIcon />}
                title="Tick every feature shown"
                onClick={selectAllFeatures}
              >
                Select all shown
              </Button>
              <Button
                startIcon={<ClearAllIcon />}
                title="Untick all features"
                onClick={() => dispatch(setSelectedFeatureIds([]))}
              >
                Clear all
              </Button>
            </ButtonGroup>
          )
        : <Typography color="text.secondary">Open a project to add features</Typography>}
    </Stack>
  )
}

export default FeaturesToolbar

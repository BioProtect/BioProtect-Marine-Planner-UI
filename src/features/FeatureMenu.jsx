import Preprocess from '@mui/icons-material/Autorenew'
import Properties from '@mui/icons-material/ErrorOutline'

import RemoveFromProject from '@mui/icons-material/Remove'
import AddToMap from '@mui/icons-material/Visibility'
import RemoveFromMap from '@mui/icons-material/VisibilityOff'
import ZoomIn from '@mui/icons-material/ZoomIn'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {
  setSelectedFeatureIds,
  toggleFeatureD,
  useGetAllFeaturesQuery,
} from '@slices/featureSlice'
import { useUpdateProjectFeaturesMutation } from '@slices/projectSlice'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

function FeatureMenu({ anchorEl, toggleFeatureLayer, toggleFeaturePUIDLayer, zoomToFeature, preprocessSingleFeature }) {
  const dispatch = useDispatch()
  const [updateProjectFeatures] = useUpdateProjectFeaturesMutation()
  const activeProjectId = useSelector(state => state.project.activeProjectId)
  const selectedFeatureId = useSelector(
    state => state.feature.selectedFeatureId,
  )
  const selectedFeatureIds = useSelector(
    state => state.feature.selectedFeatureIds,
  )
  const featureDialogs = useSelector(s => s.feature.dialogs)

  const { data: allFeaturesResp } = useGetAllFeaturesQuery()
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? []

  const selectedFeature = useMemo(() => {
    if (selectedFeatureId == null)
      return null
    return allFeatures.find(f => f.id === selectedFeatureId) ?? null
  }, [allFeatures, selectedFeatureId])

  const handleInfoMenuItemClick = () => {
    dispatch(
      toggleFeatureD({ dialogName: 'featureInfoDialogOpen', isOpen: true }),
    )
    closeDialog()
  }

  const removeFeature = async () => {
    const ids = selectedFeatureIds || []
    if (!ids.includes(selectedFeatureId))
      return

    // Toggle off map layers for the removed feature
    if (selectedFeature?.feature_layer_loaded) {
      toggleFeatureLayer(selectedFeature)
    }
    if (selectedFeature?.feature_puid_layer_loaded) {
      toggleFeaturePUIDLayer(selectedFeature)
    }

    const remainingIds = ids.filter(id => id !== selectedFeatureId)
    dispatch(setSelectedFeatureIds(remainingIds))
    dispatch(
      toggleFeatureD({
        dialogName: 'featureMenuOpen',
        isOpen: false,
      }),
    )

    const remainingFeatures = allFeatures.filter(f =>
      remainingIds.includes(f.id),
    )
    try {
      await updateProjectFeatures({
        projectId: activeProjectId,
        features: remainingFeatures,
      }).unwrap()
    }
    catch (err) {
      console.error('Failed to persist feature removal:', err)
      dispatch(setSelectedFeatureIds(ids))
    }
  }

  const closeDialog = () =>
    dispatch(toggleFeatureD({ dialogName: 'featureMenuOpen', isOpen: false }))
  return (
    <Menu
      open={featureDialogs.featureMenuOpen}
      anchorEl={anchorEl}
      onClose={() => closeDialog()}
      onMouseLeave={closeDialog}
    >
      <MenuItem onClick={() => removeFeature()}>
        <ListItemIcon>
          <RemoveFromProject />
        </ListItemIcon>
        Remove from Project
      </MenuItem>

      <MenuItem onClick={() => handleInfoMenuItemClick()}>
        <ListItemIcon>
          <Properties />
        </ListItemIcon>
        Feature Properties
      </MenuItem>

      <MenuItem
        onClick={() =>
          selectedFeature && toggleFeaturePUIDLayer(selectedFeature)}
      >
        <ListItemIcon>
          {selectedFeature?.feature_puid_layer_loaded
            ? (
                <RemoveFromMap />
              )
            : (
                <AddToMap />
              )}
        </ListItemIcon>
        {selectedFeature?.feature_puid_layer_loaded
          ? 'Remove planning unit outlines'
          : 'Outline planning units where the feature occurs'}
      </MenuItem>

      <MenuItem
        onClick={() => selectedFeature && zoomToFeature(selectedFeature)}
      >
        <ListItemIcon>
          <ZoomIn />
        </ListItemIcon>
        Zoom to Feature
      </MenuItem>

      <MenuItem
        onClick={() => preprocessSingleFeature(selectedFeatureId)}
        // {/*disabled={selectedFeatureId?.preprocessed || preprocessing}*/}
      >
        <ListItemIcon>
          <Preprocess />
        </ListItemIcon>
        Preprocess Feature
      </MenuItem>
    </Menu>
  )
}

export default FeatureMenu

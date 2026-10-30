import useAppSnackbar from '@hooks/useAppSnackbar'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { selectCurrentUser } from '@slices/authSlice'
import {
  setSelectedFeatureIds,
  toggleFeatureD,
  useDeleteFeatureMutation,
  useGetAllFeaturesQuery,
} from '@slices/featureSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BioprotectTable from '../BPComponents/BioprotectTable'
import BPDialog from '../BPDialog'
import { generateTableCols } from '../Helpers'
import { setSelectedFeatureId } from '../slices/featureSlice'
import FeaturesToolbar from './FeaturesToolbar'

function FeaturesDialog({ onOk, userRole, previewFeature }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const selectedFeatureId = useSelector(
    state => state.feature.selectedFeatureId,
  )
  const selectedFeatureIds = useSelector(
    state => state.feature.selectedFeatureIds,
  )
  const dialogIsOpen = useSelector(
    state => state.feature.dialogs.featuresDialogOpen,
  )
  const forNewProject = useSelector(
    state => state.project.dialogs.newProjectDialogOpen,
  )
  const activeProjectId = useSelector(state => state.project.activeProjectId)
  // With no project and no new project there is nothing to save ticks to.
  const canChoose = forNewProject || activeProjectId != null

  const selectionWhenOpened = useRef([])
  useEffect(() => {
    if (dialogIsOpen)
      selectionWhenOpened.current = selectedFeatureIds ?? []
  }, [dialogIsOpen])

  const [previousRow, setPreviousRow] = useState(undefined)
  const [filteredRows, setFilteredRows] = useState([])
  // Row currently queued for deletion (drives the confirm dialog).
  const [featurePendingDelete, setFeaturePendingDelete] = useState(null)
  const [confirmingRemoval, setConfirmingRemoval] = useState(false)

  const { showMessage } = useAppSnackbar()
  const [deleteFeature, { isLoading: isDeleting }] = useDeleteFeatureMutation()

  // Per-row delete gating. A user may delete a feature if they are an Admin
  // OR they personally created it. System features (created_by === "global
  // admin") are never deletable from the UI - the backend also enforces this.
  const isAdmin = userRole === 'Admin'
  const canDeleteFeature = useCallback(
    (feature) => {
      if (!feature)
        return false
      if (feature.created_by === 'global admin')
        return false
      if (isAdmin)
        return true
      return (
        !!currentUser?.username && feature.created_by === currentUser.username
      )
    },
    [isAdmin, currentUser?.username],
  )

  const deleteRowReason = useCallback(
    (feature) => {
      if (!feature)
        return null
      if (feature.created_by === 'global admin') {
        return 'System features cannot be deleted'
      }
      if (!isAdmin && feature.created_by !== currentUser?.username) {
        return 'You can only delete features you created'
      }
      return null
    },
    [isAdmin, currentUser?.username],
  )

  const closeDeleteConfirm = () => {
    if (isDeleting)
      return
    setFeaturePendingDelete(null)
  }

  const handleConfirmDelete = async () => {
    const feature = featurePendingDelete
    if (!feature)
      return
    try {
      // The server returns 200 with { error: "..." } on failure, so check the
      // body rather than relying on a thrown error.
      const result = await deleteFeature(feature.feature_class_name).unwrap()
      if (result?.error) {
        showMessage(`Failed to delete feature: ${result.error}`, 'error')
        return
      }
      // Clear any references to the now-deleted row.
      selectionWhenOpened.current = selectionWhenOpened.current.filter(
        id => id !== feature.id,
      )
      dispatch(
        setSelectedFeatureIds(
          (selectedFeatureIds || []).filter(id => id !== feature.id),
        ),
      )
      if (selectedFeatureId === feature.id) {
        dispatch(setSelectedFeatureId(null))
      }
      showMessage(`Feature "${feature.alias}" deleted`, 'success')
      setFeaturePendingDelete(null)
    }
    catch (err) {
      const message
        = err?.data?.error || err?.error || err?.message || 'Unknown error'
      showMessage(`Failed to delete feature: ${message}`, 'error')
    }
  }
  const { data: allFeaturesResp } = useGetAllFeaturesQuery(undefined, { skip: !dialogIsOpen })
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? []

  const addOrRemoveFeature = (feature) => {
    const ids = selectedFeatureIds || []
    // if the feature is already included remove it, otherwise add it
    if (ids.includes(feature.id)) {
      dispatch(setSelectedFeatureIds(ids.filter(id => id !== feature.id)))
    }
    else {
      dispatch(setSelectedFeatureIds([...ids, feature.id]))
    }
  }

  const toggleSelectionState = (selectedIds, features, first, last) => {
    const next = [...selectedIds]
    const spanned = features.slice(first, last)
    for (const feature of spanned) {
      const i = next.indexOf(feature.id)
      if (i >= 0)
        next.splice(i, 1)
      else next.push(feature.id)
    }
    return next
  }

  // Function to allow users to select multiple features using the shift key.
  // filteredRows is what's on screen, in on-screen order.
  const getFeaturesBetweenRows = (prevRow, thisRow) => {
    const prev = filteredRows.findIndex(f => f.id === prevRow.id)
    const current = filteredRows.findIndex(f => f.id === thisRow.id)
    const from = prev < current
      ? prev + 1
      : current
    const to = prev < current
      ? current + 1
      : prev

    return toggleSelectionState(selectedFeatureIds || [], filteredRows, from, to)
  }

  const clickRow = (event, row) => {
    if (!row || !canChoose)
      return

    const anchorShown = previousRow && filteredRows.some(f => f.id === previousRow.id)
    if (event.shiftKey && anchorShown)
      dispatch(setSelectedFeatureIds(getFeaturesBetweenRows(previousRow, row)))
    else
      addOrRemoveFeature(row)
    setPreviousRow(row)
  }

  // Adds to the ticks, so a search then Select all keeps what's already ticked.
  const selectAllFeatures = () => {
    const shown = filteredRows.map(f => f.id)
    dispatch(setSelectedFeatureIds([
      ...new Set([
        ...(selectedFeatureIds || []),
        ...shown,
      ]),
    ]))
  }

  const removedCount = selectionWhenOpened.current.filter(
    id => !(selectedFeatureIds || []).includes(id),
  ).length

  const handleClickOk = () => {
    // A new project has no id yet: createProject sends the ticks on Finish.
    // onOk saves to the open project, so calling it here would overwrite that.
    if (forNewProject) {
      dispatch(
        toggleFeatureD({ dialogName: 'featuresDialogOpen', isOpen: false }),
      )
      return
    }
    if (removedCount)
      setConfirmingRemoval(true)
    else
      onOk()
  }

  const handleConfirmRemoval = () => {
    setConfirmingRemoval(false)
    onOk()
  }

  const dataFiltered = useCallback(rows => setFilteredRows(rows), [])

  const columns = generateTableCols([
    { id: 'alias', label: 'alias' },
    { id: 'description', label: 'description' },
    { id: 'source', label: 'source' },
    { id: 'creation_date', label: 'Date' },
    { id: 'created_by', label: 'By' },
  ])

  const closeDialog = () => {
    // Also runs on click-outside. Unsaved ticks must not reach the info panel.
    dispatch(setSelectedFeatureIds(selectionWhenOpened.current))
    dispatch(
      toggleFeatureD({ dialogName: 'featuresDialogOpen', isOpen: false }),
    )
  }

  return (
    <BPDialog
      open={dialogIsOpen}
      onOk={handleClickOk}
      okLabel={forNewProject ? 'Use these features' : 'Save to project'}
      hideOKButton={!canChoose}
      onCancel={closeDialog}
      showCancelButton
      cancelLabel={canChoose ? 'Cancel' : 'Close'}
    >
      <div id="react-features-dialog-table">
        <BioprotectTable
          title="Features"
          showSearchBox
          toolbar={<FeaturesToolbar selectAllFeatures={selectAllFeatures} canChoose={canChoose} />}
          data={allFeatures}
          tableColumns={columns}
          searchColumns={[
            'alias',
            'description',
            'source',
            'created_by',
          ]}
          dataFiltered={dataFiltered}
          selected={selectedFeatureIds}
          selectionDisabled={!canChoose}
          clickRow={clickRow}
          preview={row => previewFeature?.(row)}
          deleteRow={row => setFeaturePendingDelete(row)}
          canDeleteRow={canDeleteFeature}
          deleteRowReason={deleteRowReason}
          deleteRowTitle="Delete this feature from the library"
        />
      </div>
      <Dialog
        open={confirmingRemoval}
        onClose={() => setConfirmingRemoval(false)}
        aria-labelledby="remove-features-dialog-title"
      >
        <DialogTitle id="remove-features-dialog-title">
          Remove
          {' '}
          {removedCount}
          {' '}
          {removedCount === 1
            ? 'feature'
            : 'features'}
          {' '}
          from this project?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Their targets and SPFs will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmingRemoval(false)}>Back</Button>
          <Button onClick={handleConfirmRemoval} color="error" variant="contained">
            Remove and save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!featurePendingDelete}
        onClose={closeDeleteConfirm}
        aria-labelledby="delete-feature-dialog-title"
        aria-describedby="delete-feature-dialog-description"
      >
        <DialogTitle id="delete-feature-dialog-title">
          Delete feature?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-feature-dialog-description">
            <p>Are you sure you want to delete the feature</p>
            <b>
              {featurePendingDelete?.alias
                ? `${featurePendingDelete.alias}`
                : ''}
              ?
            </b>
            <p>
              This will remove the feature data and cannot be undone. Features
              that are used by existing projects cannot be deleted.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </BPDialog>
  )
}

export default FeaturesDialog

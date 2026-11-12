import { getReferenceTilesTemplate, getWdpaTilesTemplate } from '@config/api'

import useAppSnackbar from '@hooks/useAppSnackbar'
import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { selectCurrentUser } from '@slices/authSlice'
import {
  projectApiSlice,
  useDeleteReferenceLayerMutation,
  useGetReferenceLayersQuery,
} from '@slices/projectSlice'
import { toggleDialog } from '@slices/uiSlice'
import { useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDeleteDialog from './BPComponents/ConfirmDeleteDialog'
import BPDialog from './BPDialog'
import CONSTANTS from './bpVars'
import FileUpload from './Uploads/FileUpload'

const FILL = CONSTANTS.WDPA_LAYER_NAME
const LINE = CONSTANTS.WDPA_LINE_LAYER_NAME

const SMALL_NOTE = 'Shapes smaller than a pixel only appear as you zoom in'

// "Oct2026" -> "Oct 2026"
const releaseLabel = release => release?.replace(/(\D)(\d)/, '$1 $2')

/**
 * Map ids for a user layer. Only the main one has the martin_ prefix, so it
 * alone gets a legend entry and is the one clicks query.
 */
function refIds(id) {
  return {
    src: `ref_src_${id}`,
    main: `martin_ref_${id}`,
    outline: `ref_outline_${id}`,
  }
}

function isVisible(map, layerId) {
  return !!map.current?.getLayer(layerId)
    && map.current.getLayoutProperty(layerId, 'visibility') === 'visible'
}

const isReference = id => id === FILL || id.startsWith('martin_ref_')

// Reference layers go beneath the planning grid and results so they never
// hide the hexes: before the first other martin_ layer, else below the
// basemap labels.
function beforeLayerId(map) {
  const layers = map.current.getStyle()?.layers || []
  const first
    = layers.find(l => l.id.startsWith('martin_') && !isReference(l.id))
      || layers.find(l => l.type === 'symbol')
  return first?.id
}

function addWdpaLayers(map, release) {
  map.current.addSource(CONSTANTS.WDPA_SOURCE_NAME, {
    type: 'vector',
    tiles: [
      getWdpaTilesTemplate(),
    ],
    maxzoom: 14,
    attribution: `UNEP-WCMC and IUCN, Protected Planet (WDPA${release
      ? `, ${releaseLabel(release)}`
      : ''})`,
  })
  const before = beforeLayerId(map)
  map.current.addLayer(
    {
      'id': FILL,
      'type': 'fill',
      'source': CONSTANTS.WDPA_SOURCE_NAME,
      'source-layer': 'wdpa_fill',
      'metadata': {
        type: CONSTANTS.LAYER_TYPE_PROTECTED_AREAS,
        name: 'Protected areas (WDPA)',
      },
      // Outline only below this. ponytail: so clicks don't identify areas
      // there either; fine at ocean scale. fill-opacity stays a plain number
      // because the legend's opacity slider reads and writes it.
      'minzoom': CONSTANTS.WDPA_FILL_MIN_ZOOM,
      'paint': {
        'fill-color': CONSTANTS.WDPA_COLOR,
        'fill-opacity': CONSTANTS.WDPA_FILL_LAYER_OPACITY,
        // Areas are stored subdivided; antialiasing would outline the seams
        'fill-antialias': false,
      },
    },
    before,
  )
  map.current.addLayer(
    {
      'id': LINE,
      'type': 'line',
      'source': CONSTANTS.WDPA_SOURCE_NAME,
      'source-layer': 'wdpa_line',
      'paint': { 'line-color': CONSTANTS.WDPA_COLOR, 'line-width': 1 },
    },
    before,
  )
}

// One source per layer; polygons get a fill plus an outline (shapes are
// stored subdivided, like WDPA), lines a line, points a circle.
function addUserLayers(map, layer) {
  const ids = refIds(layer.id)
  map.current.addSource(ids.src, {
    type: 'vector',
    tiles: [
      getReferenceTilesTemplate(layer.id),
    ],
    maxzoom: 14,
  })
  const before = beforeLayerId(map)
  const common = {
    source: ids.src,
    metadata: {
      type: CONSTANTS.LAYER_TYPE_REFERENCE,
      name: layer.name,
      colour: layer.colour,
      refId: layer.id,
    },
  }
  const c = layer.colour
  if (layer.geom_type === 'polygon') {
    map.current.addLayer({
      ...common,
      'id': ids.main,
      'type': 'fill',
      'source-layer': 'ref_fill',
      'paint': {
        'fill-color': c,
        'fill-opacity': CONSTANTS.WDPA_FILL_LAYER_OPACITY,
        'fill-antialias': false,
      },
    }, before)
    map.current.addLayer({
      'id': ids.outline,
      'type': 'line',
      'source': ids.src,
      'source-layer': 'ref_outline',
      'paint': { 'line-color': c, 'line-width': 1 },
    }, before)
  }
  else if (layer.geom_type === 'line') {
    map.current.addLayer({
      ...common,
      'id': ids.main,
      'type': 'line',
      'source-layer': 'ref_line',
      'paint': { 'line-color': c, 'line-width': 1.5, 'line-opacity': 1 },
    }, before)
  }
  else {
    map.current.addLayer({
      ...common,
      'id': ids.main,
      'type': 'circle',
      'source-layer': 'ref_point',
      'paint': {
        'circle-color': c,
        'circle-radius': 4,
        'circle-opacity': 0.9,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1,
      },
    }, before)
  }
}

function removeUserLayers(map, id) {
  const ids = refIds(id)
  ;[ids.main, ids.outline].forEach((l) => {
    if (map.current?.getLayer(l))
      map.current.removeLayer(l)
  })
  if (map.current?.getSource(ids.src))
    map.current.removeSource(ids.src)
}

function setVisibility(map, ids, on) {
  ids.forEach((id) => {
    if (map.current.getLayer(id))
      map.current.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
  })
}

function swatchSx(colour) {
  return {
    width: 14,
    height: 14,
    flex: 'none',
    borderRadius: '3px',
    bgcolor: colour,
  }
}

function ReferenceLayersDialog({ map, fileUpload, handleWebSocket }) {
  const dispatch = useDispatch()
  const { showMessage } = useAppSnackbar()
  const currentUser = useSelector(selectCurrentUser)
  const open = useSelector(s => s.ui.dialogStates.referenceLayersDialogOpen)
  const { data, isLoading, isError } = useGetReferenceLayersQuery(undefined, {
    skip: !open,
  })
  const [deleteLayer] = useDeleteReferenceLayerMutation()
  const wdpa = data?.wdpa
  const layers = data?.layers || []

  // the map owns the visibility; this just re-renders the switches
  const [, rerender] = useReducer(n => n + 1, 0)

  const [zipfile, setZipfile] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [importing, setImporting] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const toggleWdpa = () => {
    if (!map.current)
      return
    const next = !isVisible(map, FILL)
    if (!map.current.getSource(CONSTANTS.WDPA_SOURCE_NAME)) {
      addWdpaLayers(map, wdpa?.release)
    }
    setVisibility(map, [FILL, LINE], next)
    rerender()
  }

  const toggleUser = (layer) => {
    if (!map.current)
      return
    const ids = refIds(layer.id)
    const next = !isVisible(map, ids.main)
    if (!map.current.getSource(ids.src))
      addUserLayers(map, layer)
    setVisibility(map, [ids.main, ids.outline], next)
    rerender()
  }

  const canDelete = layer =>
    currentUser?.role === 'Admin'
    || (!!currentUser?.username && layer.created_by === currentUser.username)

  const confirmDelete = async () => {
    const layer = pendingDelete
    setPendingDelete(null)
    try {
      await deleteLayer(layer.id).unwrap()
      removeUserLayers(map, layer.id)
      showMessage(`Deleted '${layer.name}'`, 'success')
    }
    catch (err) {
      showMessage(err?.data?.error || 'Couldn\'t delete the layer', 'error')
    }
  }

  const importLayer = async () => {
    setImporting(true)
    const message = await handleWebSocket(
      `importReferenceLayer?zipfile=${encodeURIComponent(zipfile)}`
      + `&name=${encodeURIComponent(name.trim())}`
      + `&description=${encodeURIComponent(description.trim())}`,
    )
    setImporting(false)
    if (message?.error)
      return // WebSocketHandler has already shown it
    dispatch(projectApiSlice.util.updateQueryData('getReferenceLayers', undefined, (draft) => {
      draft.layers = message.layers
    }))
    showMessage(message.info, 'success')
    setZipfile('')
    setName('')
    setDescription('')
    const added = message.layers?.find(l => l.id === message.id)
    if (added) // switch the new layer on
      toggleUser(added)
  }

  const closeDialog = () =>
    dispatch(
      toggleDialog({ dialogName: 'referenceLayersDialogOpen', isOpen: false }),
    )

  const wdpaStatus = isError
    ? 'Couldn\'t check whether WDPA is loaded.'
    : isLoading
      ? 'Checking...'
      : !wdpa?.loaded
          ? 'WDPA is not loaded on this server (run server/db/load_wdpa.sh).'
          : `UNEP-WCMC and IUCN, Protected Planet. ${releaseLabel(wdpa.release)} release. View only: it doesn't affect the analysis.`

  return (
    <BPDialog
      open={open}
      onOk={closeDialog}
      onCancel={closeDialog}
      title="Reference layers"
      maxWidth="sm"
      fullWidth
    >
      <FormControlLabel
        control={(
          <Switch
            checked={isVisible(map, FILL)}
            onChange={toggleWdpa}
            disabled={!wdpa?.loaded}
          />
        )}
        label="WDPA protected areas (marine, boundaries only)"
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
        {wdpaStatus}
      </Typography>

      {layers.map(layer => (
        <Box key={layer.id} sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              sx={{ flex: 1, mr: 0 }}
              control={(
                <Switch
                  checked={isVisible(map, refIds(layer.id).main)}
                  onChange={() => toggleUser(layer)}
                />
              )}
              label={(
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={swatchSx(layer.colour)} />
                  {layer.name}
                </Box>
              )}
            />
            {canDelete(layer) && (
              <IconButton
                size="small"
                aria-label={`Delete ${layer.name}`}
                title="Delete this layer for everyone"
                onClick={() => setPendingDelete(layer)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
            {[
              layer.description,
              `${layer.geom_type}s, uploaded by ${layer.created_by} ${layer.created_at}`,
              layer.geom_type !== 'point' && SMALL_NOTE,
            ].filter(Boolean).join('. ')}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">Upload a reference layer</Typography>
      <Typography variant="body2" color="text.secondary">
        A zipped shapefile (with its .prj) of polygons, lines or points.
        Everyone on this server will see it. View only: it doesn&apos;t affect
        the analysis.
      </Typography>
      <FileUpload
        fileUpload={fileUpload}
        fileMatch=".zip"
        filename={zipfile}
        setFilename={setZipfile}
        label="Shapefile (.zip)"
      />
      <TextField
        label="Name"
        size="small"
        fullWidth
        sx={{ mt: 1 }}
        value={name}
        onChange={e => setName(e.target.value)}
        helperText="Leave blank to use the shapefile's name"
      />
      <TextField
        label="Description"
        size="small"
        fullWidth
        sx={{ mt: 1 }}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 1.5,
      }}
      >
        <Button
          variant="contained"
          disabled={!zipfile || importing}
          onClick={importLayer}
        >
          Upload
        </Button>
        {importing && (
          <>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Importing.. large files take a few minutes (progress in the log).
            </Typography>
          </>
        )}
      </Box>

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        title="Delete reference layer?"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        &apos;
        {pendingDelete?.name}
        &apos; will be removed for every user. This can&apos;t be undone.
      </ConfirmDeleteDialog>
    </BPDialog>
  )
}

export default ReferenceLayersDialog

import { getWdpaTilesTemplate } from '@config/api'

import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useGetReferenceLayersQuery } from '@slices/projectSlice'
import { toggleDialog } from '@slices/uiSlice'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BPDialog from './BPDialog'
import CONSTANTS from './bpVars'

const FILL = CONSTANTS.WDPA_LAYER_NAME
const LINE = CONSTANTS.WDPA_LINE_LAYER_NAME

// "Oct2026" -> "Oct 2026"
const releaseLabel = release => release?.replace(/(\D)(\d)/, '$1 $2')

function isVisible(map) {
  return !!map.current?.getLayer(FILL)
    && map.current.getLayoutProperty(FILL, 'visibility') === 'visible'
}

// WDPA goes beneath the planning grid and results so it never hides the
// hexes: before the first martin_ layer, else below the basemap labels.
function beforeLayerId(map) {
  const layers = map.current.getStyle()?.layers || []
  const first
    = layers.find(l => l.id.startsWith('martin_') && l.id !== FILL)
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

function ReferenceLayersDialog({ map }) {
  const dispatch = useDispatch()
  const open = useSelector(s => s.ui.dialogStates.referenceLayersDialogOpen)
  const { data, isLoading, isError } = useGetReferenceLayersQuery(undefined, {
    skip: !open,
  })
  const wdpa = data?.wdpa
  // the map owns the visibility; this just re-renders the switch
  const [wdpaOn, setWdpaOn] = useState(() => isVisible(map))

  const toggleWdpa = () => {
    if (!map.current)
      return
    const next = !isVisible(map)
    if (!map.current.getSource(CONSTANTS.WDPA_SOURCE_NAME)) {
      addWdpaLayers(map, wdpa?.release)
    }
    [FILL, LINE].forEach(id =>
      map.current.setLayoutProperty(
        id,
        'visibility',
        next ? 'visible' : 'none',
      ),
    )
    setWdpaOn(next)
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
    >
      <FormControlLabel
        control={(
          <Switch
            checked={wdpaOn}
            onChange={toggleWdpa}
            disabled={!wdpa?.loaded}
          />
        )}
        label="WDPA protected areas (marine, boundaries only)"
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
        {wdpaStatus}
      </Typography>
    </BPDialog>
  )
}

export default ReferenceLayersDialog

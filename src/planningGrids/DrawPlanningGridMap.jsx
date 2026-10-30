import MapboxDraw from '@mapbox/mapbox-gl-draw'

import Paper from '@mui/material/Paper'

import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

// Mini map with its own draw control, so the main map's draw.create
// handler (which opens the new-feature dialog) is left alone.
// onChange gets the drawn FeatureCollection, or null when nothing is drawn.
function DrawPlanningGridMap({ onChange }) {
  const mapContainer = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/craicerjack/cm4co2ve7000l01pfchhs2vv8',
      center: [0, 50],
      zoom: 2,
    })
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: 'draw_polygon',
    })
    map.addControl(draw)
    const emit = () => {
      const fc = draw.getAll()
      onChangeRef.current(fc.features.length ? fc : null)
    }
    map.on('draw.create', emit)
    map.on('draw.update', emit)
    map.on('draw.delete', emit)
    return () => map.remove()
  }, [])

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        height: 400,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </Paper>
  )
}

export default DrawPlanningGridMap

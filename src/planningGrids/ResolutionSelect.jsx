import { Box, Chip, MenuItem, Select, Typography } from '@mui/material'
import { useEstimateGridAreaMutation } from '@slices/planningUnitSlice'
import { useEffect, useRef, useState } from 'react'

import {
  cellsAt,
  RESOLUTIONS,
  suggestResolution,
  WARN_CELLS,
} from '../bpVars'

// Resolution picker for a new grid. Given the area being gridded (drawn
// geojson or an uploaded shapefile path) it shows estimated cell counts and
// pre-selects a suggestion, unless the user has already picked one.
function ResolutionSelect({ value, onChange, geojson, shapefilePath }) {
  const [estimateArea] = useEstimateGridAreaMutation()
  const [areaKm2, setAreaKm2] = useState(null)
  const userPicked = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    setAreaKm2(null)
    if (!geojson && !shapefilePath)
      return
    let stale = false
    estimateArea(geojson
      ? { geojson }
      : { shapefile_path: shapefilePath })
      .unwrap()
      .then((res) => {
        if (stale || res?.area_km2 == null)
          return
        setAreaKm2(res.area_km2)
        if (!userPicked.current)
          onChangeRef.current(suggestResolution(res.area_km2))
      })
      // the suggestion is optional; the dropdown works without it
      .catch(() => {})
    return () => {
      stale = true
    }
  }, [geojson, shapefilePath, estimateArea])

  const suggested = areaKm2 == null
    ? null
    : suggestResolution(areaKm2)
  const selected = RESOLUTIONS.find(r => r.value === Number(value))
  const large = areaKm2 != null && selected && cellsAt(areaKm2, selected) > WARN_CELLS

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        Resolution of planning grid
      </Typography>
      <Select
        value={value}
        onChange={(e) => {
          userPicked.current = true
          onChange(e.target.value)
        }}
        sx={{ width: 500, maxWidth: '100%' }}
      >
        {RESOLUTIONS.map(r => (
          <MenuItem key={r.value} value={r.value}>
            {r.label}
            {areaKm2 != null && ` · ~${cellsAt(areaKm2, r).toLocaleString()} cells`}
            {r.value === suggested && (
              <Chip label="Suggested" size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Select>
      {large && (
        <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
          Large grid: Prioritizr runs with a boundary penalty may be slow.
        </Typography>
      )}
    </Box>
  )
}

export default ResolutionSelect

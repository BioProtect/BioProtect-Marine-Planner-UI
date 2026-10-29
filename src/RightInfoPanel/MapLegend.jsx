import HexagonOutlinedIcon from '@mui/icons-material/HexagonOutlined'

import Box from '@mui/material/Box'

import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import Typography from '@mui/material/Typography'
import { setCellOutline } from '@slices/uiSlice'
import { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CONSTANTS, { PALETTE } from '../bpVars'
import LayerLegend from './LayerLegend'
import LayerRow, { formatPx } from './LayerRow'

// colour key: ramp with its end labels
function GradientBar({ colors, leftLabel, rightLabel }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <span style={{ whiteSpace: 'nowrap' }}>{leftLabel}</span>
      <Box
        sx={{
          flex: 1,
          height: 8,
          borderRadius: '4px',
          background: `linear-gradient(to right, ${colors.join(', ')})`,
        }}
      />
      <span style={{ whiteSpace: 'nowrap' }}>{rightLabel}</span>
    </Box>
  )
}

function fmtNum(v) {
  return Number.isFinite(Number(v))
    ? Number(v).toLocaleString()
    : v
}

function MapLegend({ changeOpacity, visibleLayers, costsLoading }) {
  const [planningGridShape] = useState('hexagon')
  const selectedRunIds = useSelector(s => s.prioritizr.selectedRunIds)
  const cellOutline = useSelector(s => s.ui.cellOutline)
  const dispatch = useDispatch()

  // Prioritizr results: opacity, with the selection-frequency ramp as key
  const getPrioritizrResultsLegend = (layer) => {
    const runCount = selectedRunIds.length
    return (
      <LayerLegend
        key={`legend_${layer.id}`}
        changeOpacity={changeOpacity}
        layer={layer}
        items={[
          {
            fillColor: PALETTE.results[8],
            strokeColor: 'transparent',
            label: 'Selected planning units',
          },
        ]}
      >
        {runCount > 1 && (
          <GradientBar
            colors={PALETTE.results}
            leftLabel="1 run"
            rightLabel={`${runCount} runs`}
          />
        )}
      </LayerLegend>
    )
  }

  // Shown straight after the results layer. No eye: width 0 is "off".
  const getCellOutlineLegend = () => (
    <LayerRow
      name="Cell outlines"
      icon={<HexagonOutlinedIcon sx={{ fontSize: 20, color: 'brand.muted' }} />}
      value={cellOutline.width}
      min={0}
      max={4}
      step={0.5}
      format={formatPx}
      onChange={v => dispatch(setCellOutline({ width: v }))}
    >
      <FormControlLabel
        sx={{ ml: 0, mr: 0, gap: 1 }}
        control={(
          <Switch
            size="small"
            checked={cellOutline.selectedOnly}
            onChange={e =>
              dispatch(setCellOutline({ selectedOnly: e.target.checked }))}
          />
        )}
        label={(
          <Typography sx={{ fontSize: 12, color: 'text.primary' }}>
            Selected cells only
          </Typography>
        )}
      />
    </LayerRow>
  )

  // Legend order: results (+ cell outlines), status, cost, then the rest.
  // Feature/activity groups follow these, see the return below.
  const LEGEND_ORDER = {
    [CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS]: 0,
    [CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS]: 1,
    [CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST]: 2,
  }

  const getNonFeatureLegendItems = () => {
    const rank = layer => LEGEND_ORDER[layer.metadata?.type] ?? 3
    // ponytail: selection-highlight layer shares LAYER_TYPE_PLANNING_UNITS_STATUS
    // with the status layer but shouldn't get its own legend entry
    const layers = visibleLayers
      .filter(layer => layer.metadata?.name !== 'Planning Unit Selection')
      .sort((a, b) => rank(a) - rank(b))
    return layers.map((layer) => {
      // get a unique key create the legend for non-feature layers
      const key = `legend_${layer.id}`

      if (layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_LAYER) {
        return null
      }

      switch (layer.metadata.type) {
        case CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS:
          return (
            <Fragment key={key}>
              {getPrioritizrResultsLegend(layer)}
              {getCellOutlineLegend()}
            </Fragment>
          )

        case CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST: {
          const minVal = layer.metadata.min
          const maxVal = layer.metadata.max

          return (
            <LayerLegend
              key={key}
              loading={costsLoading}
              changeOpacity={changeOpacity}
              layer={layer}
            >
              <GradientBar
                colors={PALETTE.costs}
                leftLabel={minVal != null
                  ? fmtNum(minVal)
                  : 'Low'}
                rightLabel={maxVal != null
                  ? fmtNum(maxVal)
                  : 'High'}
              />
            </LayerLegend>
          )
        }

        case CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS: {
          const puLayer = layers.find(l => l.id === CONSTANTS.PU_LAYER_NAME)
          const statusLayer = layers.find(
            l => l.id === CONSTANTS.STATUS_LAYER_NAME,
          )

          return (
            <LayerLegend
              key={key}
              changeOpacity={changeOpacity}
              layer={layer}
              subLayers={[puLayer, statusLayer].filter(Boolean)}
              items={[
                CONSTANTS.PU_STATUS_DEFAULT,
                CONSTANTS.PU_STATUS_LOCKED_IN,
                CONSTANTS.PU_STATUS_LOCKED_OUT,
              ]}
              shape={planningGridShape}
            />
          )
        }
        case CONSTANTS.LAYER_TYPE_PROTECTED_AREAS:
          return (
            <LayerLegend
              key={key}
              changeOpacity={changeOpacity}
              layer={layer}
              items={[
                {
                  fillColor: CONSTANTS.WDPA_COLOR,
                  strokeColor: CONSTANTS.WDPA_COLOR,
                  label: 'Protected areas (WDPA)',
                },
              ]}
              shape="square"
            />
          )

        default:
          return null
      }
    })
  }

  const getFeatureLegendItems = () => {
    const featureLayers = visibleLayers.filter(
      layer => layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
    )
    const items = featureLayers.map(layer => ({
      fillColor: layer.paint['fill-color'],
      strokeColor: 'lightgray',
      label: layer.metadata.name,
      layer,
    }))
    items.sort((a, b) =>
      a.label.toLowerCase() < b.label.toLowerCase()
        ? -1
        : 1,
    )
    return items.length
      ? (
          <LayerLegend
            changeOpacity={changeOpacity}
            layer={{
              metadata: { name: 'Features' },
            }}
            subLayers={featureLayers}
            items={items}
            shape="hexagon"
          />
        )
      : null
  }

  const getActivityLegendItems = () => {
    const activityLayers = visibleLayers.filter(
      layer => layer.metadata.type === CONSTANTS.LAYER_TYPE_ACTIVITY,
    )
    const items = activityLayers.map(layer => ({
      fillColor: layer.paint['fill-color'],
      strokeColor: 'lightgray',
      label: layer.metadata.name,
      layer,
    }))
    items.sort((a, b) =>
      a.label.toLowerCase() < b.label.toLowerCase()
        ? -1
        : 1,
    )
    return items.length
      ? (
          <LayerLegend
            changeOpacity={changeOpacity}
            layer={{
              metadata: { name: 'Activities' },
            }}
            subLayers={activityLayers}
            items={items}
            shape="square"
          />
        )
      : null
  }

  const getFeaturePUIDLegendItems = () => {
    const featurePUIDLayers = visibleLayers.filter(
      layer => layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER,
    )
    const items = featurePUIDLayers.map(layer => ({
      fillColor: 'none',
      strokeColor: layer.metadata.lineColor,
      label: layer.metadata.name,
      layer,
    }))
    return items.length
      ? (
          <LayerLegend
            changeOpacity={changeOpacity}
            layer={{
              metadata: { name: 'Planning units for features' },
            }}
            subLayers={featurePUIDLayers}
            items={items}
            shape={planningGridShape}
          />
        )
      : null
  }

  return (
    <Box
      sx={{
        'maxHeight': 'calc(100vh - 200px)', // responsive vertical size
        'overflowY': 'auto',
        'px': 2, // keep rows off the panel edge
        'pb': 1,
        // optional: MUI theme scrollbar
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
      }}
    >
      {getNonFeatureLegendItems()}
      {getFeatureLegendItems()}
      {getActivityLegendItems()}
      {getFeaturePUIDLegendItems()}
    </Box>
  )
}

export default MapLegend

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { LEVELS } from './clusteringLevels'

const SLIDER_MARKS = LEVELS.map(({ value, label }) => ({ value, label }))

function penaltyToStep(penalty) {
  const match = LEVELS.find(l => Math.abs(l.penalty - penalty) < 1e-9)
  return match ? match.value : 0
}

function BoundaryPenaltyControl({ value, onChange, disabled }) {
  const step = penaltyToStep(value)
  const current = LEVELS[step] ?? LEVELS[0]

  const handleChange = (_e, newStep) => {
    const next = LEVELS[newStep] ?? LEVELS[0]
    onChange(next.penalty)
  }

  return (
    <Box sx={{ px: 2, py: 1, width: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Clustering
        </Typography>
        <Tooltip
          title="Higher levels group selected planning units into compact patches, at some extra cost. Clustered runs take longer (up to about 4 minutes on large grids)."
          arrow
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }}
          />
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {current.label}
        </Typography>
      </Stack>

      <Slider
        size="small"
        value={step}
        onChange={handleChange}
        disabled={disabled}
        step={null}
        min={0}
        max={LEVELS.length - 1}
        marks={SLIDER_MARKS}
        sx={{
          'mt': 0.5,
          '& .MuiSlider-markLabel': { fontSize: '0.65rem' },
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
      >
        {current.hint}
      </Typography>
    </Box>
  )
}

export default BoundaryPenaltyControl

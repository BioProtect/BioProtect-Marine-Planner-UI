import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { formatPct } from '../Helpers'

// One Legend-tab block, always fully shown:
//   [eye]  name                  value
//          ------o--------------          slider
//          key (children)
// Blocks stack with a hairline between them. Pass `icon` to replace the eye
// (cell outlines has no visibility toggle).
function LayerRow({
  name,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  format = formatPct,
  icon,
  children,
}) {
  // last non-zero value, restored when the eye is turned back on
  const [restore, setRestore] = useState(0.5)
  const visible = value > 0

  const toggle = () => {
    if (visible) {
      setRestore(value)
      onChange(0)
    }
    else {
      onChange(restore)
    }
  }

  return (
    <Box
      sx={{
        'py': '11px',
        '& + &': { borderTop: 1, borderColor: 'brand.border' },
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        minHeight: 26,
      }}
      >
        {icon ?? (
          <IconButton
            onClick={toggle}
            title="Click to toggle visibility"
            aria-label={`Show ${name}`}
            aria-pressed={visible}
            sx={{
              'p': 0,
              'width': 20,
              'height': 20,
              'color': visible ? 'primary.main' : 'brand.muted',
              '&.Mui-focusVisible, &:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            {visible
              ? (
                  <VisibilityIcon sx={{ fontSize: 20 }} />
                )
              : (
                  <VisibilityOffIcon sx={{ fontSize: 20 }} />
                )}
          </IconButton>
        )}
        <Typography
          noWrap
          sx={{
            flex: 1,
            fontSize: 14,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {format(value)}
        </Typography>
      </Box>
      <Box sx={{ pl: '30px', pr: 0.5 }}>
        <Slider
          size="small"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e, v) => {
            if (v > 0)
              setRestore(v)
            onChange(v)
          }}
          aria-label={icon
            ? name
            : `Opacity, ${name}`}
          getAriaValueText={format}
        />
      </Box>
      {children && (
        <Box sx={{ pl: '30px', fontSize: 12, color: 'text.secondary' }}>
          {children}
        </Box>
      )}
    </Box>
  )
}

export default LayerRow

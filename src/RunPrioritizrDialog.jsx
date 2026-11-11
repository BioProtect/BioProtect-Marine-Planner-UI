import { useOnValueChange } from '@hooks/useOnValueChange'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { toggleDialog } from '@slices/uiSlice'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BPDialog from './BPDialog'
import BoundaryPenaltyControl from './LeftInfoPanel/BoundaryPenaltyControl'

// Modal shown when the user clicks "Run Prioritizr". Lets them name and
// describe the run, and pick a boundary penalty before kicking it off.
function RunPrioritizrDialog({
  runPrioitizr,
  boundaryPenalty,
  setBoundaryPenalty,
}) {
  const dispatch = useDispatch()
  const open = useSelector(
    s => s.ui.dialogStates.runPrioritizrDialogOpen ?? false,
  )

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // off by default: the normalised cost penalty keeps targets met
  const [cohon, setCohon] = useState(false)

  // Default the name to a timestamp every time the dialog opens so the user
  // gets something sensible without having to think.
  useOnValueChange(open, (isOpen) => {
    if (!isOpen)
      return
    const stamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    setName(`Run ${stamp}`)
    setDescription('')
    setSubmitting(false)
  })

  const close = () =>
    dispatch(
      toggleDialog({ dialogName: 'runPrioritizrDialogOpen', isOpen: false }),
    )

  const handleRun = async () => {
    if (submitting)
      return
    setSubmitting(true)
    // Close immediately so the results panel / log tab takes over the UI;
    // runPrioitizr handles the websocket lifecycle from here.
    close()
    try {
      await runPrioitizr({
        name: name.trim() || null,
        description: description.trim() || null,
        boundaryPenalty,
        cohon,
      })
    }
    finally {
      setSubmitting(false)
    }
  }

  return (
    <BPDialog
      open={open}
      title="Run Prioritizr"
      contentWidth={420}
      showCancelButton
      okLabel="Run"
      okDisabled={submitting}
      onOk={handleRun}
      onCancel={close}
    >
      <Box sx={{ width: 420 }}>
        <Stack spacing={2} sx={{ py: 1 }}>
          <TextField
            label="Name"
            size="small"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            size="small"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            placeholder="Optional notes about this run"
          />
          <BoundaryPenaltyControl
            value={boundaryPenalty ?? 0}
            onChange={setBoundaryPenalty}
          />
          <Box sx={{ px: 2 }}>
            <FormControlLabel
              control={(
                <Switch
                  size="small"
                  checked={cohon}
                  onChange={e => setCohon(e.target.checked)}
                />
              )}
              label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Calibrate cost penalty (Cohon)</Typography>}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
              {cohon
                ? 'Weighs cost evenly against targets: cheaper plans, but some targets may fall short. Adds about a minute on large grids.'
                : 'Cost only breaks ties between equally good cells, so targets are met first.'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </BPDialog>
  )
}

export default RunPrioritizrDialog

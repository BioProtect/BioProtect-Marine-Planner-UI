import useAppSnackbar from '@hooks/useAppSnackbar'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DrawPlanningGridMap from '@planningGrids/DrawPlanningGridMap'
import { useCreateFeatureFromDrawingMutation } from '@slices/featureSlice'
import { useState } from 'react'

// Draw polygons on a mini map and save them as a library feature.
// The server cuts land out of the drawing.
function DrawFeatureDialog({ open, onClose }) {
  const { showMessage } = useAppSnackbar()
  const [createFeature, { isLoading }] = useCreateFeatureFromDrawingMutation()
  const [geojson, setGeojson] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const save = async () => {
    try {
      const res = await createFeature({
        name: name.trim(),
        description,
        geojson,
      }).unwrap()
      if (res?.error) {
        showMessage(res.error, 'error')
        return
      }
      showMessage(res.info, 'success')
      onClose()
    }
    catch (err) {
      showMessage(`Failed to create the feature: ${err?.data?.error ?? err?.status ?? err}`, 'error')
    }
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Draw Feature</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Click to add points, double-click to finish a polygon. Land is removed when you save.
        </Typography>
        <DrawPlanningGridMap onChange={setGeojson} />
        <TextField
          fullWidth
          required
          margin="normal"
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextField
          fullWidth
          multiline
          margin="normal"
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" disabled={isLoading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={isLoading || !geojson || !name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DrawFeatureDialog

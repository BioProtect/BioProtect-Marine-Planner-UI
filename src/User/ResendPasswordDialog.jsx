import useAppSnackbar from '@hooks/useAppSnackbar'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { toggleDialog } from '@slices/uiSlice'
import { useLazyResendPasswordQuery } from '@slices/userSlice'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

function ResendPasswordDialog({
  open,
  resending,
}) {
  const [resendEmail, setResendEmail] = useState('')
  const dispatch = useDispatch()
  const uiState = useSelector(state => state.ui)
  const { showMessage } = useAppSnackbar()
  const [triggerResendPassword] = useLazyResendPasswordQuery()

  const resendPassword = async () => {
    try {
      // ponytail: backend resend_password is a stub that ignores the email; pass resendEmail once it's implemented
      const response = await triggerResendPassword().unwrap()
      showMessage(response.info, 'success')
      dispatch(
        toggleDialog({ dialogName: 'resendPasswordDialogOpen', isOpen: false }),
      )
    }
    catch (error) {
      console.error('Failed to resend password:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      resendPassword()
    }
  }

  const closeDialog = () => dispatch(toggleDialog({
    dialogName: 'resendPasswordDialogOpen',
    isOpen: false,
  }))

  return (
    <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Resend Password</DialogTitle>
      <DialogContent>
        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          value={resendEmail}
          onChange={e => setResendEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={uiState.loading}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} disabled={resending} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={resendPassword}
          disabled={!resendEmail || uiState.loading}
          variant="contained"
          color="primary"
        >
          Resend
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ResendPasswordDialog

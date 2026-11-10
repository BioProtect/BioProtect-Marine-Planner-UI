// hooks/useAppSnackbar.js
import { useSnackbar } from 'notistack'
import { useCallback } from 'react'

function useAppSnackbar() {
  const { enqueueSnackbar } = useSnackbar()

  const showMessage = useCallback((message, variant = 'default') => {
    if (!message)
      return
    enqueueSnackbar(message, { variant }) // variant: success, error, warning, info, default
  }, [enqueueSnackbar])

  return { showMessage }
}

export default useAppSnackbar

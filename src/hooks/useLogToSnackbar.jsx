import useAppSnackbar from '@hooks/useAppSnackbar'

import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

export function useLogToSnackbar(filterFn) {
  const log = useSelector(state => state.ui.importLog)
  // track entries, not length: removeImportLogMessage shrinks the log
  const seen = useRef(new WeakSet())
  const { showMessage } = useAppSnackbar()

  useEffect(() => {
    const newMsg = log.at(-1)
    if (!newMsg || seen.current.has(newMsg))
      return
    seen.current.add(newMsg)
    if (filterFn(newMsg)) {
      const text = newMsg.info || newMsg.status || 'Unknown message'
      const variant = /error/i.test(text)
        ? 'error'
        : 'info'
      showMessage(text, variant)
    }
  }, [log, filterFn, showMessage])
}

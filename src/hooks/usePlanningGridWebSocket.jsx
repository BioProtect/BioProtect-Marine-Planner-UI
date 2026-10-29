import { getWsBaseUrl } from '@config/api'
import useAppSnackbar from '@hooks/useAppSnackbar'

import { useCallback, useRef } from 'react'

export function usePlanningGridWebSocket() {
  const socketRef = useRef(null)
  const { showMessage } = useAppSnackbar()

  const createPlanningGridViaWebSocket = useCallback(
    (
      // { shapefile_path | geojson, alias, description, resolution }
      params,
      { onUpdate, onSuccess, onError },
    ) => {
      // SOME AWFUL SHITE GOING ON HERE WITH SERVERS
      // so todo
      // sort out Server/serverFunctions and loading the websocket endpoint
      // just gonna hardcode it for the minute
      // const socket = new WebSocket("ws://0.0.0.0:8080/server/createPlanningUnitGrid"); // Adjust if needed
      const socket = new WebSocket(`${getWsBaseUrl()}createPlanningUnitGrid`)
      socketRef.current = socket
      // set once the server has reported success or an error
      let finished = false

      socket.onopen = () => {
        socket.send(JSON.stringify(params))
        onUpdate?.('🟢 Starting...')
      }

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)

          // Hard error
          if (msg.error) {
            finished = true
            showMessage(msg.error, 'error')
            onError?.(msg.error)
            socket.close()
            return
          }

          // Grid already exists → ask user
          if (msg.type === 'grid_exists') {
            finished = true
            showMessage(msg.info, 'info')
            onSuccess?.(msg) // treat like success
            socket.close()
            return
          }

          // Explicit success
          if (msg.success === true) {
            finished = true
            if (msg.info)
              showMessage(msg.info, 'success')
            onUpdate?.(msg.info ?? '✅ Done')
            onSuccess?.(msg)
            socket.close()
            return
          }

          // Progress messages go to the caller to display, not to toasts
          if (msg.info) {
            onUpdate?.(msg.info)
            return
          }

          // fallback
          onUpdate?.(JSON.stringify(msg))
        }
        catch {
          const errMsg = '⚠️ Malformed message from server'
          finished = true
          showMessage(errMsg, 'error')
          onError?.(errMsg)
          socket.close()
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        const errMsg = '🚨 WebSocket connection failed'
        finished = true
        showMessage(errMsg, 'error')
        onError?.(errMsg)
      }

      socket.onclose = () => {
        // Closed with no result: tell the caller so it isn't left waiting
        if (!finished) {
          const errMsg
            = 'Connection closed before the planning grid was created'
          showMessage(errMsg, 'error')
          onError?.(errMsg)
        }
      }
    },
    [],
  )

  const closeConnection = () => {
    if (socketRef.current) {
      socketRef.current.close()
    }
  }

  return {
    createPlanningGridViaWebSocket,
    closeConnection,
  }
}

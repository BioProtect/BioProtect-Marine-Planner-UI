import { addToImportLog, removeImportLogMessage } from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import { prioritizrApiSlice } from "@slices/prioritizrApiSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useCallback } from "react";

const useWebSocketHandler = (
  checkForErrors,
  setPreprocessing,
  setPid,
  newFeatureCreated,
) => {
  const dispatch = useDispatch();
  const activeProjectId = useSelector((state) => state.project.activeProjectId);
  const websocketEndpoint = useSelector(
    (state) => state.project.bpServer.websocketEndpoint,
  );
  const { showMessage } = useAppSnackbar();

  const logMessage = useCallback(
    (msg) => {
      dispatch(
        addToImportLog({
          ...msg,
          time: new Date().toLocaleTimeString(),
        }),
      );
    },
    [dispatch],
  );

  const removeMessageFromLog = useCallback(
    (matchText) => {
      dispatch(removeImportLogMessage(matchText));
    },
    [dispatch],
  );

  // Combined WebSocket handler
  const handleWebSocket = useCallback(
    (params) => {
      return new Promise((resolve, reject) => {
        console.log("Connecting to:", websocketEndpoint + params);
        const ws = new WebSocket(websocketEndpoint + params);
        // Track when this socket opened so we can compute elapsed time
        // for streaming "Running" messages.
        let startTime = null;

        ws.onopen = () => {
          startTime = Date.now();
          setPreprocessing(true);
        };

        ws.onmessage = async (evt) => {
          const message = JSON.parse(evt.data);
          console.log("message from websocker - ", message);
          // Compute elapsed seconds since the socket opened so the log
          // can show "Running — 00:23" style timestamps.
          if (startTime != null) {
            message.elapsed = Math.max(
              0,
              Math.floor((Date.now() - startTime) / 1000),
            );
          }
          if (message.info) showMessage(message.info, "info");
          if (!checkForErrors(message)) {
            logMessage(message);

            // If this message relates to a Prioritizr run, invalidate run tags
            if (message.run_id != null) {
              dispatch(
                prioritizrApiSlice.util.invalidateTags([
                  { type: "PrioritizrRun", id: "LIST" },
                  { type: "PrioritizrRun", id: activeProjectId },
                  { type: "PrioritizrRun", id: message.run_id },
                ]),
              );
            }

            switch (message.status) {
              case "Started":
                setPreprocessing(true);
                break;
              case "pid":
                setPid(message.pid);
                break;
              case "FeatureCreated":
                removeMessageFromLog("Preprocessing");
                await newFeatureCreated(message.id);
                break;
              case "Finished":
                setPid(0);
                removeMessageFromLog("Preprocessing");
                setPreprocessing(false);
                resolve(message);
                ws.close();
                break;
              default:
                break;
            }
          } else {
            logMessage({
              ...message,
              status: message.status,
              info: "error" || "WebSocketError",
            });
            showMessage(message.error, "error");
            setPreprocessing(false);
            reject(new Error(message.error || "WebSocket error occurred"));
            ws.close();
          }
        };

        ws.onerror = (evt) => {
          console.error("WebSocket error:", evt);
          logMessage({ status: "WebSocketError", detail: evt });
          showMessage("WebSocket error", "error");
          setPreprocessing(false);
          ws.close();
          reject(new Error("WebSocket connection error"));
        };

        ws.onclose = (evt) => {
          setPreprocessing(false);
          console.warn("WebSocket closed:", evt);
          if (!evt.wasClean || evt.code !== 1000) {
            let reason = evt.reason || "No reason provided";
            showMessage(reason, "error");
            logMessage({
              status: "SocketClosedUnexpectedly",
              code: evt.code,
              reason: reason,
              error: reason,
            });
            reject(
              new Error(
                `WebSocket closed unexpectedly: ${evt.code} - ${reason}`,
              ),
            );
          } else {
            showMessage("Socket Closed", "info");
            logMessage({ status: "SocketClosedCleanly" });
          }
        };
      });
    },
    [
      websocketEndpoint,
      activeProjectId,
      showMessage,
      checkForErrors,
      setPreprocessing,
      setPid,
      newFeatureCreated,
      logMessage,
      removeMessageFromLog,
      dispatch,
    ],
  );

  return handleWebSocket;
};

export default useWebSocketHandler;

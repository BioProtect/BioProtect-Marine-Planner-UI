import { addToImportLog, removeImportLogMessage } from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import useAppSnackbar from "@hooks/useAppSnackbar";
import { useCallback } from "react";

const useWebSocketHandler = (
  checkForErrors,
  setPreprocessing,
  setPid,
  newFeatureCreated
) => {
  const dispatch = useDispatch();
  const projState = useSelector((state) => state.project);
  const { showMessage } = useAppSnackbar();

  const logMessage = useCallback(
    (msg) => {
      dispatch(
        addToImportLog({
          ...msg,
          time: new Date().toLocaleTimeString(),
        })
      );
    },
    [dispatch]
  );

  const removeMessageFromLog = useCallback(
    (matchText) => {
      dispatch(removeImportLogMessage(matchText));
    },
    [dispatch]
  );

  // Combined WebSocket handler
  const handleWebSocket = useCallback(
    (params) => {
      return new Promise((resolve, reject) => {
        console.log(
          "Connecting to:",
          projState.bpServer.websocketEndpoint + params
        );
        const ws = new WebSocket(projState.bpServer.websocketEndpoint + params);

        ws.onopen = () => setPreprocessing(true);

        ws.onmessage = async (evt) => {
          const message = JSON.parse(evt.data);
          console.log("message from websocker - ", message);
          showMessage(message.info, "info");
          if (!checkForErrors(message)) {
            logMessage(message);

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
                `WebSocket closed unexpectedly: ${evt.code} - ${reason}`
              )
            );
          } else {
            showMessage("Socket Closed", "info");
            logMessage({ status: "SocketClosedCleanly" });
          }
        };
      });
    },
    [
      projState.bpServer.websocketEndpoint,
      showMessage,
      checkForErrors,
      setPreprocessing,
      setPid,
      newFeatureCreated,
      logMessage,
      removeMessageFromLog,
    ]
  );

  return handleWebSocket;
};

export default useWebSocketHandler;

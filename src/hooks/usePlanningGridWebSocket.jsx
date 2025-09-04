import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import useAppSnackbar from "@hooks/useAppSnackbar";

export const usePlanningGridWebSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const projState = useSelector((state) => state.project);
  const { showMessage } = useAppSnackbar();

  const createPlanningGridViaWebSocket = useCallback(({
    shapefile_path, alias, description, resolution
  }, {
    onUpdate, onSuccess, onError
  }) => {

    console.log("projState: ", projState)
    console.log("projState.bpServer: ", projState.bpServer)
    console.log("projState.bpServer.websocketEndpoint: ", projState.bpServer.websocketEndpoint)
    const socket = new WebSocket(`${projState.bpServer.websocketEndpoint}createPlanningUnitGrid`); // Adjust if needed
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ shapefile_path, alias, description, resolution }));
      showMessage("🟢 Upload started...", "info");
      onUpdate?.("🟢 Upload started...");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.error) {
          showMessage(msg.error, "error");
          onError?.(msg.error);
          socket.close();
        } else if (msg.success || msg.info) {
          showMessage(msg.success || msg.info, "success");
          onUpdate?.(msg.success || msg.info);
          onSuccess?.(msg);
          socket.close();
        } else {
          showMessage(msg, "info");
          onUpdate?.(msg); // intermediate status messages
        }
      } catch (e) {
        const errMsg = "⚠️ Malformed message from server";
        showMessage(errMsg, e, "error");
        onError?.(errMsg);
        socket.close();
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      const errMsg = "🚨 WebSocket connection failed";
      showMessage(errMsg, "error");
      onError?.(errMsg);
    };

    socket.onclose = () => {
      showMessage("🧹 WebSocket closed");
      console.log("🧹 WebSocket closed");
    };
  },
    []
  );

  const closeConnection = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  return {
    createPlanningGridViaWebSocket,
    closeConnection,
  };
};

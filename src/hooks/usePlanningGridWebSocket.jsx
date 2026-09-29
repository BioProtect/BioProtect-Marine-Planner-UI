import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getWsBaseUrl } from "@config/api";
import useAppSnackbar from "@hooks/useAppSnackbar";

export const usePlanningGridWebSocket = () => {
  const socketRef = useRef(null);
  const { showMessage } = useAppSnackbar();

  const createPlanningGridViaWebSocket = useCallback(
    (
      { shapefile_path, alias, description, resolution },
      { onUpdate, onSuccess, onError },
    ) => {
      // SOME AWFUL SHITE GOING ON HERE WITH SERVERS
      // so todo
      // sort out Server/serverFunctions and loading the websocket endpoint
      // just gonna hardcode it for the minute
      // const socket = new WebSocket("ws://0.0.0.0:8080/server/createPlanningUnitGrid"); // Adjust if needed
      const socket = new WebSocket(getWsBaseUrl() + "createPlanningUnitGrid");
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(
          JSON.stringify({ shapefile_path, alias, description, resolution }),
        );
        showMessage("🟢 Upload started...", "info");
        onUpdate?.("🟢 Upload started...");
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Hard error
          if (msg.error) {
            showMessage(msg.error, "error");
            onError?.(msg.error);
            socket.close();
            return;
          }

          // Grid already exists → ask user
          if (msg.type === "grid_exists") {
            showMessage(msg.info, "info");
            onSuccess?.(msg); // treat like success
            socket.close();
            return;
          }

          // Explicit success
          if (msg.success === true) {
            if (msg.info) showMessage(msg.info, "success");
            onUpdate?.(msg.info ?? "✅ Done");
            onSuccess?.(msg);
            socket.close();
            return;
          }

          // Progress/info messages
          if (msg.info) {
            onUpdate?.(msg.info);
            showMessage(msg.info);
            return;
          }

          // fallback
          onUpdate?.(JSON.stringify(msg));
        } catch (e) {
          const errMsg = "⚠️ Malformed message from server";
          showMessage(errMsg, "error");
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
    [],
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

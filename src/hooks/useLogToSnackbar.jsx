import { useEffect, useRef } from "react";

import useAppSnackbar from "@hooks/useAppSnackbar";
import { useSelector } from "react-redux";

export const useLogToSnackbar = (filterFn) => {
  const log = useSelector((state) => state.ui.importLog);
  const lastSeen = useRef(0);
  const { showMessage } = useAppSnackbar();

  useEffect(() => {
    if (log.length > lastSeen.current) {
      const newMsg = log.at(-1);
      if (newMsg && filterFn(newMsg)) {
        const text = newMsg.info || newMsg.status || "Unknown message";
        const variant = /error/i.test(text) ? "error" : "info";
        showMessage(text, variant);
      }
      lastSeen.current = log.length;
    }
  }, [log, filterFn, showMessage]);
};

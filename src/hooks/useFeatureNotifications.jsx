import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { featureApiSlice } from "@slices/featureSlice";
import { addFeaturesToCache } from "@store/featureCacheActions";
import { addFeatureAttributes } from "@features/featureUtils";
import { getApiBaseUrl, getWsBaseUrl } from "@config/api";

const RECONNECT_DELAY = 3000;

const useFeatureNotifications = () => {
  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    const connect = () => {
      const url = getWsBaseUrl() + "notifications";
      const ws = new WebSocket(url);

      ws.onmessage = async (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.event === "feature-created" && data.metadataId) {
            const resp = await dispatch(
              featureApiSlice.endpoints.getFeature.initiate(data.metadataId),
            );
            const feature = resp?.data?.data?.[0];
            if (feature) {
              dispatch(
                addFeaturesToCache({
                  features: [addFeatureAttributes(feature)],
                }),
              );
            }
          }
        } catch (e) {
          console.warn("Notification parse error:", e);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [dispatch]);
};

export default useFeatureNotifications;

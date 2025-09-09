import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Box } from "@mui/material";
import mapboxgl from "mapbox-gl";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { zoomToBounds } from "./Helpers";

// Refactored functional component
const MapContainer2 = ({
  planningGridMetadata,
  getTilesetMetadata,
  color = "rgba(255, 0, 0, 0.4)",
  outlineColor = "rgba(255, 0, 0, 0.5)",
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const { showMessage } = useAppSnackbar();

  useEffect(() => {
    if (!planningGridMetadata?.tilesetid || !planningGridMetadata?.feature_class_name) {
      // nothing to draw yet
      return;
    }
    // Initialize the map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/craicerjack/cm4co2ve7000l01pfchhs2vv8",
      center: [0, 0],
      zoom: 4,
      attributionControl: false,
    });
    mapRef.current = map;

    const sourceId = `pg_src_${tilesetId}`;
    const layerId = `pg_layer_${tilesetId}`;
    let destroyed = false;

    const onLoad = () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "vector",
          url: `mapbox://${planningGridMetadata.tilesetid}`,
        });
      }

      // Add fill layer
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          "source-layer": planningGridMetadata.feature_class_name,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.9,
            "fill-outline-color": outlineColor,
          },
        });
      }
    };

    map.on('load', onLoad);

    // Fetch tileset metadata (bounds) and fit
    (async () => {
      try {
        const tileset = await getTilesetMetadata(planningGridMetadata.tilesetid);
        if (tileset?.bounds) {
          zoomToBounds(map, tileset.bounds);
        }
      } catch (err) {
        showMessage(`Error fetching tileset metadata: ${err}`, "error");
      }
    })();

    // cleanup
    return () => {
      try {
        map.off("load", onLoad);
        map.remove();
      } catch {
        /* ignore if already removed */
      }
    };
  }, [planningGridMetadata?.tilesetid, planningGridMetadata?.feature_class_name, getTilesetMetadata, color, outlineColor]);

  return (
    <Box
      ref={mapContainerRef}
      sx={{
        width: "500px",
        height: "300px",
        marginTop: "50px",
        marginLeft: "24px",
        position: "relative",
      }}
    />
  );
};

export default MapContainer2;

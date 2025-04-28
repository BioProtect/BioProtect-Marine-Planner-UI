import React, { useEffect, useRef } from "react";
import { setSnackbarMessage, setSnackbarOpen } from "./slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import { Box } from "@mui/material";
import mapboxgl from "mapbox-gl";
import { zoomToBounds } from "./Helpers";

// Refactored functional component
const MapContainer2 = ({
  planningGridMetadata,
  getTilesetMetadata,
  color = "rgba(255, 0, 0, 0.4)",
  outlineColor = "rgba(255, 0, 0, 0.5)",
}) => {
  const dispatch = useDispatch();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize the map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/craicerjack/cm4co2ve7000l01pfchhs2vv8",
      center: [0, 0],
      zoom: 4,
      attributionControl: false,
    });

    const map = mapRef.current;

    map.current.on("load", () => {
      map.current.addLayer({
        id: "planning_grid",
        type: "fill",
        source: {
          type: "vector",
          url: `mapbox://${planningGridMetadata.tilesetid}`,
        },
        "source-layer": planningGridMetadata.feature_class_name,
        paint: {
          "fill-color": color,
          "fill-opacity": 0.9,
          "fill-outline-color": outlineColor,
        },
      });
    });

    // Fetch tileset metadata and adjust bounds
    getTilesetMetadata(planningGridMetadata.tilesetid)
      .then((tileset) => {
        if (tileset.bounds) zoomToBounds(map, tileset.bounds);
      })
      .catch((error) => {
        dispatch(setSnackbarOpen(true));
        dispatch(setSnackbarMessage(error));
      });

    // Cleanup function to remove the map
    return () => {
      if (map) map.current.remove();
    };
  }, [planningGridMetadata, getTilesetMetadata]);

  return (
    <Box
      ref={mapContainerRef}
      sx={{
        width: "352px",
        height: "300px",
        marginTop: "50px",
        marginLeft: "24px",
        position: "relative",
      }}
    />
  );
};

export default MapContainer2;

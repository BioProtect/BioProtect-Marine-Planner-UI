import React, { useEffect, useRef } from "react";

import { Box } from "@mui/material";
import mapboxgl from "mapbox-gl";
import { zoomToBounds } from "./Helpers";

const getTableName = (tilesetid) => {
  // supports "schema.table" or "table"
  if (!tilesetid) return "";
  const parts = String(tilesetid).split(".");
  return parts.length > 1 ? parts[1] : parts[0];
};

const MapContainer2 = ({
  planningGridMetadata,              // expects { tilesetid: "bioprotect.f_0539..." } or "f_0539..."
  color = "rgba(255, 0, 0, 0.4)",
  outlineColor = "rgba(255, 0, 0, 0.5)",
  martinBase = "http://localhost:3000/",
}) => {
  const mapEl = useRef(null);

  console.log("planningGridMetadata ", planningGridMetadata);

  useEffect(() => {
    const tilesetid = planningGridMetadata?.tilesetid;
    const tableName = getTableName(tilesetid);
    if (!tableName) return;

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/craicerjack/cm4co2ve7000l01pfchhs2vv8",
      center: [0, 0],
      zoom: 4,
      attributionControl: false,
    });

    const sourceId = `martin_src_${tableName}`;
    console.log("sourceId ", sourceId);
    const layerId = `martin_layer_${tableName}`;
    console.log("layerId ", layerId);
    const tileJSON = new URL(tableName, martinBase).toString();
    console.log("tileJSON ", tileJSON);

    const onLoad = async () => {
      // 1) Source via TileJSON URL (no manual tiles array needed)
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "vector",
          url: tileJSON, // <-- Martin TileJSON
        });
      }

      // 2) Layer using the correct source-layer (the table name)
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          "source-layer": tableName,
          layout: { visibility: "visible" },
          paint: {
            "fill-color": color,
            "fill-opacity": 0.9,
            "fill-outline-color": outlineColor,
          },
        });
      }

      // 3) Optional: fetch TileJSON once to fit bounds
      try {
        const tj = await (await fetch(tileJSON)).json();
        console.log("tj ", tj);
        if (Array.isArray(tj.bounds) && tj.bounds.length === 4) {
          const sw = [tj.bounds[0], tj.bounds[1]]; // [minLng, minLat]
          const ne = [tj.bounds[2], tj.bounds[3]]; // [maxLng, maxLat]

          // Ensure it runs once the style is ready and canvas is laid out
          map.once("idle", () => {
            map.resize();
            map.fitBounds([sw, ne], { padding: 24, duration: 0 });
          });
        }
      } catch {
        // ignore if bounds not available
      }
    };

    if (map.loaded()) {
      onLoad()
    } else {
      map.on("load", onLoad);
    }

    return () => {
      try {
        map.off("load", onLoad);
        map.remove();
      } catch { }
    };
  }, [planningGridMetadata?.tilesetid, color, outlineColor, martinBase]);

  return (
    <Box
      ref={mapEl}
      sx={{ width: 500, height: 300, mt: "50px", ml: "24px", position: "relative" }}
    />
  );
};

export default MapContainer2;

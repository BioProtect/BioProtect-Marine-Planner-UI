/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useEffect, useState } from "react";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import axios from "axios";
import wellknown from "wellknown"; // Make sure to install wellknown library

const SelectMapboxLayer = ({
  map,
  mapboxUser,
  items,
  selectedValue,
  changeItem,
  width,
}) => {
  const [mapLayers, setmapLayers] = useState([])
  const [mapSources, setmapSources] = useState([])
  const [selectedLayer, setSelectedLayer] = useState(selectedValue);

  // This effect will run when the selected layer changes
  useEffect(() => {
    if (selectedLayer) {
      const selectedItem = items.find(
        (item) => item.tilesetid === selectedLayer
      );
      if (selectedItem && selectedItem.envelope) {
        const envelope = getLatLngLikeFromWKT(selectedItem.envelope);
        map.fitBounds(envelope, {
          easing: function (num) {
            return 1;
          },
        });
      }
      addLayerToMap(selectedLayer);
    }
  }, [selectedLayer]);

  const getLatLngLikeFromWKT = (wkt) => {
    console.log("Parsing WKT:", wkt);
    try {
      const geometry = wellknown.parse(wkt);

      if (
        geometry?.type === "MultiPolygon" &&
        geometry.coordinates?.length > 0
      ) {
        const coords = geometry.coordinates[0][0];
        const sw = coords[0];
        const ne = coords[2];
        return [
          [sw[0], sw[1]],
          [ne[0], ne[1]],
        ];
      }

      throw new Error("Unsupported geometry type");
    } catch (e) {
      console.warn("Failed to parse WKT:", wkt, e.message);
      return [
        [0, 0],
        [0, 0],
      ];
    }
  };

  // Function to handle selecting an item
  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedLayer(value);
    changeItem(value);
  };


  const addLayerToMap = async (tilesetid) => {
    const sourceId = `martin_src_${tilesetid}`;
    const layerId = `martin_layer_pu_${tilesetid}`;
    const tileUrl = `http://localhost:3000/${tilesetid}`; // Replace with your actual Martin endpoint

    // Remove existing layer if it exists
    // Remove previous layers
    map.getStyle().layers.forEach((layer) => {
      if (layer.id.startsWith("martin_layer_pu_")) {
        if (map.getLayer(layer.id)) {
          map.removeLayer(layer.id);
        }
      }
    });

    // Remove previous sources
    Object.keys(map.getStyle().sources).forEach((source) => {
      if (source.startsWith("martin_src_")) {
        if (map.getSource(source)) {
          map.removeSource(source);
        }
      }
    });

    // Add vector tile source from Martin
    map.addSource(sourceId, {
      type: 'vector',
      url: `http://0.0.0.0:3000/${tilesetid}`
    });

    map.addLayer({
      id: layerId,
      type: "fill",
      source: sourceId,
      "source-layer": tilesetid, // MUST match the name of the view in PostGIS
      paint: {
        "fill-color": "#0080ff",
        "fill-opacity": 0.2,
        "fill-outline-color": "black",
      },
    });
  };


  return (
    <Select
      value={selectedLayer}
      onChange={handleSelectChange}
      style={{ width: width, verticalAlign: "middle" }}
    >
      {items.map((item) => (
        <MenuItem
          key={item.tilesetid}
          value={item.tilesetid}
          style={{ fontSize: "12px" }}
        >
          {item.alias}
        </MenuItem>
      ))}
    </Select>
  );
};

export default SelectMapboxLayer;

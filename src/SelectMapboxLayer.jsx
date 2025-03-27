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
  const [selectedLayer, setSelectedLayer] = useState(selectedValue);

  // This effect will run when the selected layer changes
  useEffect(() => {
    if (selectedLayer) {
      const selectedItem = items.find(
        (item) => item.feature_class_name === selectedLayer
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

  // Function to handle selecting an item
  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedLayer(value);
    changeItem(value);
  };

  // Function to convert WKT to LatLng
  const getLatLngLikeFromWKT = (wkt) => {
    let envelope, returnVal;
    const geometry = wellknown.parse(wkt);

    if (geometry.coordinates.length > 1) {
      let west = geometry.coordinates[0];
      let east = geometry.coordinates[1];
      returnVal = [
        [east[0][1][0], east[0][1][1]],
        [west[0][1][0] + 360, west[0][1][1]],
      ];
    } else {
      envelope = geometry.coordinates[0];
      returnVal = [
        [envelope[0][0], envelope[0][1]],
        [envelope[2][0], envelope[2][1]],
      ];
    }
    return returnVal;
  };

  // Function to add layer to the map
  const addLayerToMap = (mapboxLayerName) => {
    axios
      .get(
        `https://api.mapbox.com/v4/${mapboxUser}.${mapboxLayerName}.json?access_token=YOUR_ACCESS_TOKEN`
      )
      .then((response) => {
        if (response.status === 200) {
          const previousLayerId =
            map.getStyle().layers[map.getStyle().layers.length - 1].id;

          // Remove previous planning unit layer
          if (previousLayerId.substr(0, 3) === "pu_") {
            map.removeLayer(previousLayerId);
          }

          // Remove source if it exists
          if (map.getSource(mapboxUser)) {
            map.removeSource(mapboxUser);
          }

          // Add source and layer
          map.addSource(mapboxUser, {
            type: "vector",
            url: `mapbox://${mapboxUser}.${mapboxLayerName}`,
          });

          map.addLayer({
            id: mapboxLayerName,
            type: "fill",
            source: mapboxUser,
            "source-layer": mapboxLayerName,
            paint: {
              "fill-color": "#f08",
              "fill-opacity": 0.4,
            },
          });
        } else {
          console.log("The MapBox layer does not exist");
        }
      })
      .catch((error) => {
        console.error("Error adding layer to map: ", error);
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
          key={item.feature_class_name}
          value={item.feature_class_name}
          style={{ fontSize: "12px" }}
        >
          {item.alias}
        </MenuItem>
      ))}
    </Select>
  );
};

export default SelectMapboxLayer;

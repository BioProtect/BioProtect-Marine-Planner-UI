import React, { useEffect, useRef, useState } from "react";

import SelectMapboxLayer from "../SelectMapboxLayer";
import mapboxgl from "mapbox-gl";

const PlanningUnitsDialog = (props) => {
  console.log("props ", props);
  const [map, setMap] = useState(null);
  const [planningUnitGridsReceived, setPlanningUnitGridsReceived] =
    useState(false);

  // Reference for the map container div
  const mapContainer = useRef(null);

  // Initialize the Mapbox map once the component is mounted
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/craicerjack/ckf6p8lax0q4319my1f2dbi7v",
      // style: "mapbox://styles/blishten/cjg6jk8vg3tir2spd2eatu5fd", // north star + marine PAs in pacific
      center: [0, 0],
      zoom: 2,
    });

    // Save the map instance to state
    setMap(mapInstance);

    return () => {
      if (mapInstance) mapInstance.remove(); // Clean up on unmount
    };
  }, []);

  return (
    <div className="newPUDialogPane">
      <div>
        <div
          ref={mapContainer}
          className="absolute top right left bottom"
          style={{
            width: "352px",
            height: "300px",
            marginTop: "50px",
            marginLeft: "24px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "380px",
            verticalAlign: "middle",
          }}
        >
          <SelectMapboxLayer
            selectedValue={props.pu}
            map={map}
            mapboxUser={"craicerjack"}
            items={props.planning_unit_grids}
            changeItem={props.changeItem}
            disabled={!planningUnitGridsReceived}
            width={"352px"}
          />
        </div>
      </div>
    </div>
  );
};

export default PlanningUnitsDialog;

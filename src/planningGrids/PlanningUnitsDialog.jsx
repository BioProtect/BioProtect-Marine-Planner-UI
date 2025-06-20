import { Box, Paper, Stack } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { setPlanningUnitGrids, useListPlanningUnitsQuery } from "@slices/planningUnitSlice"
import { useDispatch, useSelector } from "react-redux";

import SelectMapboxLayer from "../SelectMapboxLayer";
import mapboxgl from "mapbox-gl";

const PlanningUnitsDialog = ({
  previewFeature,
  changeItem,
  pu,
  openImportPlanningGridDialog,
  puMap,
  setPuMap,
}) => {
  const dispatch = useDispatch();
  const [planningUnitGridsReceived, setPlanningUnitGridsReceived] =
    useState(false);

  // Reference for the map container div
  const mapContainer = useRef(null);
  const puState = useSelector((state) => state.planningUnit)

  const { data: planningUnitsData } = useListPlanningUnitsQuery();

  useEffect(() => {
    if (planningUnitsData) {
      dispatch(setPlanningUnitGrids(planningUnitsData.planning_unit_grids || []));
    }
  }, [dispatch, planningUnitsData]);


  // Initialize the Mapbox map once the component is mounted
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/craicerjack/cm4co2ve7000l01pfchhs2vv8",
      center: [0, 0],
      zoom: 2,
    });

    // Save the map instance to state
    setPuMap(mapInstance);

    return () => {
      if (mapInstance) mapInstance.remove(); // Clean up on unmount
    };
  }, []);

  return (
    <Box className="newPUDialogPane" sx={{ p: 2 }}>
      <Stack spacing={3}>
        {/* Map container */}
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            height: 400,
            mt: 2,
            ml: 3,
            overflow: "hidden",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <Box
            ref={mapContainer}
            sx={{
              width: "100%",
              height: "100%",
            }}
          />
        </Paper>

        {/* Layer selector */}
        <Box sx={{ mt: 2 }}>
          <SelectMapboxLayer
            selectedValue={pu}
            map={puMap}
            mapboxUser={"craicerjack"}
            items={puState.planningUnitGrids}
            changeItem={changeItem}
            disabled={!planningUnitGridsReceived}
            width={"500px"}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default PlanningUnitsDialog;

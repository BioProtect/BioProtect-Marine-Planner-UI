import { Box, Grid, Paper, Stack } from "@mui/material";
import { setCurrentPUGrid, setPlanningUnitGrids, useListPlanningUnitGridsQuery } from "@slices/planningUnitSlice";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SelectMapboxLayer from "../SelectMapboxLayer";
import Typography from "@mui/material/Typography";
import {
  faFileCode
} from "@fortawesome/free-solid-svg-icons";
import mapboxgl from "mapbox-gl";
import { togglePUD } from "@slices/planningUnitSlice";

const PlanningUnitsDialog = ({
  previewFeature,
  puMap,
  setPuMap,
}) => {
  const dispatch = useDispatch();

  // Reference for the map container div
  const mapContainer = useRef(null);
  const puState = useSelector((state) => state.planningUnit)
  const { data: planningUnitsData } = useListPlanningUnitGridsQuery();

  useEffect(() => {
    if (planningUnitsData) {
      // If it's a plain array
      if (Array.isArray(planningUnitsData)) {
        dispatch(setPlanningUnitGrids(planningUnitsData));
      } else if (planningUnitsData.planning_unit_grids) {
        dispatch(setPlanningUnitGrids(planningUnitsData.planning_unit_grids));
      }
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
    // Wait until fully loaded before exposing it
    mapInstance.on("load", () => setPuMap(mapInstance));
    return () => {
      if (mapInstance) mapInstance.remove(); // Clean up on unmount
    };
  }, []);

  const closeDialog = useCallback(() => {
    dispatch(
      togglePUD({
        dialogName: "planningGridsDialogOpen",
        isOpen: false,
      })
    );
  }, []);


  const openNewPlanningGridDialog = useCallback(() => {
    dispatch(
      togglePUD({
        dialogName: "newPlanningGridDialogOpen",
        isOpen: true,
      })
    );
    closeDialog();
  }, [closeDialog]);

  const changeItem = (event) => dispatch(setCurrentPUGrid(event));
  const safeSelected = puState.currentPUGrid || puState.planningUnitGrids?.[0]?.tilesetid || "";


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
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                Select Planning Unit Grid
              </Typography>
              <SelectMapboxLayer
                selectedValue={safeSelected}
                map={puMap}
                items={puState.planningUnitGrids}
                changeItem={changeItem}
                width={"500px"}
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export default PlanningUnitsDialog;

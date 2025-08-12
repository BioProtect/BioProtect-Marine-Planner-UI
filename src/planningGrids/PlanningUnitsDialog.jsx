import { Box, Grid, Paper, Stack } from "@mui/material";
import { setPlanningUnitGrids, useListPlanningUnitGridsQuery } from "@slices/planningUnitSlice";
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
  console.log("puState ", puState);

  const { data: planningUnitsData } = useListPlanningUnitGridsQuery();
  console.log("planningUnitsData ", planningUnitsData);

  useEffect(() => {
    if (planningUnitsData) {
      console.log("planningUnitsData: ", planningUnitsData);

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

    // Save the map instance to state
    setPuMap(mapInstance);

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
                selectedValue={pu}
                map={puMap}
                mapboxUser={"craicerjack"}
                items={puState.planningUnitGrids}
                changeItem={changeItem}
                disabled={!planningUnitGridsReceived}
                width={"500px"}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="h5" gutterBottom>
                <h3>OR</h3>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant="h6" gutterBottom>
                Import a Shapefile
              </Typography>
              <Button
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faFileCode} />}
                title="Import from simple Shapefile"
                onClick={openNewPlanningGridDialog}
              >
                Import Shapefile
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export default PlanningUnitsDialog;

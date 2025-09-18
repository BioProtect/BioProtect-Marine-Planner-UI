import { Box, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  setPlanningUnitGrids,
  useListPlanningUnitGridsQuery
} from "@slices/planningUnitSlice";
import { useDispatch, useSelector, } from "react-redux";

import FileUpload from "../Uploads/FileUpload";
import MarxanDialog from "../MarxanDialog";
import { togglePUD } from "@slices/planningUnitSlice";
import { usePlanningGridWebSocket } from "@hooks/usePlanningGridWebSocket";

const NewPlanningGridDialog = ({ loading, fileUpload }) => {

  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit)
  const uiState = useSelector((state) => state.ui)
  const { createPlanningGridViaWebSocket } = usePlanningGridWebSocket();
  const { refetch: refetchPlanningUnitGrids } = useListPlanningUnitGridsQuery();



  const [planningGridName, setPlanningGridName] = useState("");
  const [resolution, setResolution] = useState("7")

  const resolutionOptions = [{
    label: "Basin resolution (36 km²)",
    value: "6",
  }, {
    label: "Regional resolution (5 km²)",
    value: "7",
  }, {
    label: "Local resolution (0.7 km²)",
    value: "8",
  }]

  useEffect(() => {
    if (uiState.fileUploadResponse?.file) {
      setPlanningGridName(uiState.fileUploadResponse.file.replaceAll("_", " ").split(".")[0]);
    }
  }, [uiState.fileUploadResponse]);

  const createPlanningUnitGrid = (filename, planningGridName, resolution) => {
    createPlanningGridViaWebSocket({
      shapefile_path: filename,
      alias: planningGridName,
      description: `Grid created from uploaded shapefile`,
      resolution: resolution,
    }, {
      onUpdate: (msg) => { console.log(msg); },
      onSuccess: async (result) => {
        showMessage(result?.info || "Planning grid created");


        const updated = await refetchPlanningUnitGrids();
        if (updated.data?.planning_unit_grids?.length > 0) {
          const grids = updated.data.planning_unit_grids;
          dispatch(setPlanningUnitGrids(grids));

          const newGrid = grids.find(
            (g) => g.alias === `${planningGridName} (Res ${resolution})`
          );
          if (newGrid?.tilesetid) {
            setPu(newGrid.tilesetid);
            changeItem(newGrid.tilesetid);
          }
        }

        dispatch(
          togglePUD({
            dialogName: "newPlanningGridDialogOpen",
            isOpen: false,
          })
        );
      },
      onError: (errMsg) => {
        showMessage(`❌ ${errMsg}`);
      },
    }
    );
  };

  const handleOk = async () => {
    console.log("filename,resolution: ", uiState.fileUploadResponse, resolution);
    const filename = `imports/${uiState.fileUploadResponse?.file}`;
    try {
      console.log("creating planning unit grid.....")
      await createPlanningUnitGrid(
        filename,
        planningGridName,
        resolution
      );
      dispatch(setPlanningGridUploaded(true))
      closeDialog();
    } catch (error) {
      console.error("Error creating planning grid:", error);
    }
  };

  const closeDialog = () => {
    console.log("closeDialog");
    dispatch(
      togglePUD({
        dialogName: "newPlanningGridDialogOpen",
        isOpen: false,
      })

    );
  }


  return (
    <MarxanDialog
      open={puState.dialogs.newPlanningGridDialogOpen}
      onOk={handleOk}
      onClose={() => closeDialog()}
      onCancel={() => closeDialog()}
      okDisabled={!resolution || loading}
      cancelLabel="Cancel"
      showCancelButton
      title="New planning grid"
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <FileUpload
          loading={uiState.loading}
          fileUpload={fileUpload}
          fileMatch=".zip"
          mandatory
          destFolder="data/tmp/"
          label="Shapefile"
        />
        <TextField
          label="Name"
          fullWidth
          value={planningGridName}
          onChange={(e) => setPlanningGridName(e.target.value)}
        />
        <Box>
          <Typography variant="body2" gutterBottom>
            Resolution of planning grid
          </Typography>
          <Select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            sx={{ width: "500px" }}
          >
            {resolutionOptions.map((item) => (
              <MenuItem key={item.label} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    </MarxanDialog >
  );
};

export default NewPlanningGridDialog;

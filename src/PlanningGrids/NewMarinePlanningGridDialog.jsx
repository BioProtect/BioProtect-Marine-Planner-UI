import { Box, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CONSTANTS from "../constants";
import FileUpload from "../Uploads/FileUpload";
import MarxanDialog from "../MarxanDialog";
import { togglePUD } from "../slices/planningUnitSlice";

const NewMarinePlanningGridDialog = ({
  loading,
  createNewPlanningUnitGrid,
  fileUpload,
}) => {

  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit)

  const [filename, setFilename] = useState("");
  const [planningGridName, setPlanningGridName] = useState("");
  const [shape, setShape] = useState("");
  const [areakm2, setAreaKm2] = useState("");

  const handleOk = async () => {
    try {
      await createNewPlanningUnitGrid(
        filename,
        planningGridName,
        areakm2,
        shape
      );
      closeDialog();
    } catch (error) {
      console.error("Error creating planning grid:", error);
    }
  };

  const closeDialog = () => {
    console.log("closeDialog");
    dispatch(
      togglePUD({
        dialogName: "newMarinePlanningGridDialogOpen",
        isOpen: false,
      })

    );
  }

  const dropDownStyle = { width: "240px" };

  return (
    <MarxanDialog
      open={puState.dialogs.newMarinePlanningGridDialogOpen}
      onOk={handleOk}
      onClose={() => closeDialog()}
      onCancel={() => closeDialog()}
      okDisabled={!areakm2 || loading}
      cancelLabel="Cancel"
      showCancelButton
      helpLink="user.html#creating-new-planning-grids-using-marxan-web"
      title="New planning grid"
      contentWidth={358}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <FileUpload
          fileMatch=".zip"
          destFolder="data/tmp/"
          mandatory
          filename={filename}
          setFilename={setFilename}
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
            Planning unit shape
          </Typography>
          <Select
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            style={dropDownStyle}
          >
            {CONSTANTS.SHAPES.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography variant="body2" gutterBottom>
            Area of each planning unit
          </Typography>
          <Select
            value={areakm2}
            onChange={(e) => setAreaKm2(e.target.value)}
            style={dropDownStyle}
          >
            {CONSTANTS.AREAKM2S.map((item) => (
              <MenuItem key={item} value={item}>
                {item} Km²
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    </MarxanDialog>
  );
};

export default NewMarinePlanningGridDialog;

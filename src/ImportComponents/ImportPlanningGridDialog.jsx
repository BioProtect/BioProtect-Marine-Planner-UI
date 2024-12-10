import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import FileUpload from "../Uploads/FileUpload";
import FormControl from "@mui/material/FormControl";
import MarxanDialog from "../MarxanDialog";
import TextField from "@mui/material/TextField";
import { togglePlanningGridDialog } from "../slices/uiSlice";

const ImportPlanningGridDialog = (props) => {
  const dispatch = useDispatch();
  const planningGridDialogStates = useSelector(
    (state) => state.ui.planningGridDialogStates
  );
  const [planningGridName, setPlanningGridName] = useState("");
  const [zipFilename, setZipFilename] = useState("");
  const [description, setDescription] = useState("");

  // Handles when OK is clicked
  const handleOk = () => {
    const _description =
      description === ""
        ? "Imported using the import planning grid dialog"
        : description;

    props
      .importPlanningUnitGrid(zipFilename, planningGridName, _description)
      .then(() => {
        // Reset the state after successful upload
        setPlanningGridName("");
        setZipFilename("");
        setDescription("");
      })
      .catch((ex) => {
        // Handle any error during upload
        console.error("Error uploading shapefile:", ex);
      });
  };

  const closeDialog = () =>
    dispatch(
      togglePlanningGridDialog({
        dialogName: "importPlanningGridDialogOpen",
        isOpen: false,
      })
    );

  return (
    <MarxanDialog
      open={planningGridDialogStates.importPlanningGridDialogOpen}
      fullWidth={true}
      maxWidth="md"
      title="Import Planning grid"
      contentWidth={390}
      showCancelButton={true}
      onOk={handleOk}
      okDisabled={
        props.loading ||
        planningGridName === "" ||
        zipFilename === "" ||
        description === ""
      }
      onClose={() => closeDialog()}
      onCancel={() => closeDialog()}
    >
      <React.Fragment key="22">
        <FormControl fullWidth variant="outlined" margin="normal">
          <FileUpload
            {...props}
            fileMatch=".zip"
            destFolder="imports"
            mandatory={true}
            filename={zipFilename}
            setFilename={setZipFilename}
            label="Shapefile"
          />
          <TextField
            margin="normal"
            id="name"
            label="name"
            name="name"
            value={planningGridName}
            onChange={(e) => setPlanningGridName(e.target.value)}
          />
          <TextField
            margin="normal"
            id="description"
            label="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>
      </React.Fragment>
    </MarxanDialog>
  );
};

export default ImportPlanningGridDialog;

import React, { useState } from "react";
import { setLoading, setSelectedActivity, setSnackbarMessage, setSnackbarOpen, toggleDialog } from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FileUpload from "../Uploads/FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "../MarxanDialog";
import MarxanTextField from "../MarxanTextField";
import Sync from "@mui/icons-material/Sync";
import TextField from "@mui/material/TextField";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { generateTableCols } from "../Helpers";

// Initial state configuration
const INITIAL_STATE = {
  steps: ["Select Activity", "Import or Draw", "Upload Data"],
  title: ["Select Activity", "Import or Draw", "Upload Data"],
};

const HumanActivitiesDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [stepIndex, setStepIndex] = useState(0);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [searchText, setSearchText] = useState("");

  const handleNext = () => {
    if (stepIndex === INITIAL_STATE.steps.length - 1) {
      handleSaveActivity(filename, uiState.selectedActivity.activity, description);
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => {
    setStepIndex(stepIndex - 1);
  };

  const handleSaveActivity = async (filename, selectedActivity, description) => {
    console.log("selectedActivity ", selectedActivity);
    dispatch(setLoading(true));
    props.startLogging();
    const url = `saveRaster?filename=${filename}&activity=${selectedActivity}&description=${description}`;
    const response = await props.handleWebSocket(url).catch(err => {
      console.error("WebSocket failed:", err);
      return { error: `WebSocket error occurred - ${err.message}` };
    });

    const message = response?.info || response?.error || "No response";
    dispatch(setSnackbarOpen(true));
    dispatch(setSnackbarMessage(message));
    dispatch(setLoading(false));
    closeDialog();
    dispatch(toggleDialog({
      dialogName: "importedActivitiesDialogOpen",
      isOpen: true
    }))
  };

  const clickRow = (evt, rowInfo) => {
    dispatch(setSelectedActivity(rowInfo));
  }

  const closeDialog = () => {
    setStepIndex(0);
    setFilename("");
    setDescription("");
    setSearchText("");
    dispatch(setSelectedActivity(""));
    dispatch(setSnackbarMessage(""));
    dispatch(
      toggleDialog({ dialogName: "humanActivitiesDialogOpen", isOpen: false })
    );
  };

  const tableColumns = generateTableCols([
    { id: "category", label: "category" },
    { id: "activity", label: "activity" },
  ]);

  const isNextDisabled = () => {
    if (stepIndex === 0) {
      return uiState.selectedActivity === "";
    }
    if (stepIndex === 1) {
      return filename === "";
    }
    return false;
  };

  const actions =
    <ButtonGroup aria-label="Basic button group" >
      {stepIndex !== 1 && (
        <>
          <Button
            onClick={handlePrev}
            disabled={stepIndex === 0 || uiState.loading}
          >
            Back
          </Button>
          <Button
            onClick={() => handleNext()}
            disabled={
              isNextDisabled() ||
              uiState.loading ||
              (stepIndex === 2 && (filename === "" || description === ""))
            }
          >
            {stepIndex === INITIAL_STATE.steps.length - 1
              ? "Save to Database"
              : "Next"}
          </Button>
        </>
      )}
    </ButtonGroup>;



  return (
    <MarxanDialog
      loading={uiState.loading}
      open={dialogStates.humanActivitiesDialogOpen}
      onOk={() => closeDialog()}
      onClose={() => closeDialog()}
      okLabel={"Cancel"}
      title={INITIAL_STATE.title[stepIndex]}
      actions={actions}
      helpLink={"user.html#importing-from-a-shapefile"}
      fullWidth={true}
    >
      {stepIndex === 0 && (
        <div id="activityTable">
          <BioprotectTable
            title="Select an activity then upload your raster file"
            data={uiState.activities}
            tableColumns={tableColumns}
            ableToSelectAll={false}
            searchColumns={["category", "activity"]}
            searchText={searchText}
            selected={[uiState.selectedActivity]}
            clickRow={clickRow}
            showSearchBox={true}
          />
        </div>
      )}
      {stepIndex === 1 && (
        <div>
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="Import"
            disabled={uiState.loading}
            onClick={handleNext}
          >
            Import from Raster
          </Button>
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="Draw on screen"
            disabled={true}
            onClick={props.initialiseDigitising}
          >
            Draw on screen
          </Button>
        </div>
      )}
      {stepIndex === 2 && (
        <div>
          <FileUpload
            {...props}
            fileMatch={".tif"}
            mandatory={true}
            filename={filename}
            setFilename={setFilename}
            destFolder={"imports"}
            label="Upload Raster"
            style={{ paddingTop: "10px" }}
          />
          <TextField
            fullWidth={true}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            label="Enter a description"
            variant="outlined"
          />
        </div>
      )}
    </MarxanDialog>
  );
}

export default HumanActivitiesDialog;

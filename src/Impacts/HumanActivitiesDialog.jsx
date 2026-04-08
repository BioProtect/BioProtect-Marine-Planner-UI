import React, { useState } from "react";
import {
  setLoading,
  setSelectedActivity,
  setUploadedActivities,
  toggleDialog,
} from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FileUpload from "../Uploads/FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "../MarxanDialog";
import TextField from "@mui/material/TextField";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { generateTableCols } from "../Helpers";
import useAppSnackbar from "@hooks/useAppSnackbar";

const STEPS = ["Select Activity", "Import Type", "Upload Data"];

const HumanActivitiesDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [stepIndex, setStepIndex] = useState(0);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [searchText, setSearchText] = useState("");
  const [uploadType, setUploadType] = useState(""); // 'raster' or 'shapefile'
  const { showMessage } = useAppSnackbar();

  const handleNext = () => {
    if (stepIndex === STEPS.length - 1) {
      handleSaveActivity();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => {
    setStepIndex(stepIndex - 1);
  };

  const selectUploadType = (type) => {
    setUploadType(type);
    setStepIndex(2);
  };

  const handleSaveActivity = async () => {
    const activity = uiState.selectedActivity.activity;
    dispatch(setLoading(true));
    props.startLogging();

    let importFilename = filename;

    // For shapefiles, unzip first to get the .shp filename
    if (uploadType === "shapefile") {
      const unzipResponse = await props.unzipShapefile(filename);
      if (unzipResponse?.error) {
        showMessage(unzipResponse.error, "error");
        dispatch(setLoading(false));
        return;
      }
      importFilename = unzipResponse.rootfilename + ".shp";
    }

    const url =
      `uploadActivity?filename=${importFilename}` +
      `&activity=${activity}` +
      `&description=${encodeURIComponent(description)}` +
      `&upload_type=${uploadType}`;

    const response = await props.handleWebSocket(url).catch((err) => {
      console.error("WebSocket failed:", err);
      return { error: `WebSocket error occurred - ${err.message}` };
    });

    const message = response?.info || response?.error || "No response";
    showMessage(message, response?.error ? "error" : "success");

    // Refresh the uploaded activities list
    if (!response?.error) {
      const activitiesData = await props._get("getUploadedActivities");
      if (activitiesData?.data) {
        dispatch(setUploadedActivities(activitiesData.data));
      }
    }

    dispatch(setLoading(false));
    closeDialog();
  };

  const clickRow = (evt, rowInfo) => {
    dispatch(setSelectedActivity(rowInfo));
  };

  const closeDialog = () => {
    setStepIndex(0);
    setFilename("");
    setDescription("");
    setSearchText("");
    setUploadType("");
    dispatch(setSelectedActivity(""));
    dispatch(
      toggleDialog({ dialogName: "humanActivitiesDialogOpen", isOpen: false })
    );
  };

  const tableColumns = generateTableCols([
    { id: "category", label: "category" },
    { id: "activity", label: "activity" },
  ]);

  const isNextDisabled = () => {
    if (stepIndex === 0) return uiState.selectedActivity === "";
    if (stepIndex === 2) return filename === "" || description === "";
    return false;
  };

  const fileMatch =
    uploadType === "raster" ? ".tif,.tiff" : ".zip";

  const actions = (
    <ButtonGroup aria-label="Basic button group">
      {stepIndex !== 1 && (
        <>
          <Button
            onClick={handlePrev}
            disabled={stepIndex === 0 || uiState.loading}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isNextDisabled() || uiState.loading}
          >
            {stepIndex === STEPS.length - 1 ? "Save to Database" : "Next"}
          </Button>
        </>
      )}
    </ButtonGroup>
  );

  return (
    <MarxanDialog
      loading={uiState.loading}
      open={dialogStates.humanActivitiesDialogOpen}
      onOk={closeDialog}
      onClose={closeDialog}
      okLabel="Cancel"
      title={STEPS[stepIndex]}
      actions={actions}
      fullWidth={true}
    >
      {stepIndex === 0 && (
        <div id="activityTable">
          <BioprotectTable
            title="Select an activity then upload your data"
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
        <ButtonGroup aria-label="Import type" fullWidth>
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="Import from a raster (.tif) file"
            disabled={uiState.loading}
            onClick={() => selectUploadType("raster")}
          >
            Import from Raster
          </Button>
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="Import from a zipped shapefile (.zip)"
            disabled={uiState.loading}
            onClick={() => selectUploadType("shapefile")}
          >
            Import from Shapefile
          </Button>
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="Draw on screen"
            disabled={true}
            onClick={props.initialiseDigitising}
          >
            Draw on screen
          </Button>
        </ButtonGroup>
      )}
      {stepIndex === 2 && (
        <div>
          <FileUpload
            {...props}
            fileMatch={fileMatch}
            mandatory={true}
            filename={filename}
            setFilename={setFilename}
            destFolder="imports"
            label={
              uploadType === "raster"
                ? "Upload Raster (.tif)"
                : "Upload Shapefile (.zip)"
            }
            style={{ paddingTop: "10px" }}
          />
          <TextField
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            label="Enter a description"
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </div>
      )}
    </MarxanDialog>
  );
};

export default HumanActivitiesDialog;

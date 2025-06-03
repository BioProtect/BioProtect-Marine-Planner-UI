import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";

import FileUpload from "../FileUpload";
import MarxanTable from "../MarxanTable";
import SyncIcon from "@mui/icons-material/Sync";
import { setSnackbarMessage } from "../slices/uiSlice";
import { useDispatch } from "react-redux";

const title = ["Import Activity", "Upload Raster File"];

const ImportActivityDialog = ({
  onCancel,
  saveActivityToDb,
  activities,
  loading,
}) => {
  const dispatch = useDispatch();
  const [steps, setSteps] = useState(["Select Activity", "Raster Upload"]);
  const [stepIndex, setStepIndex] = useState(0);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [searchtext, setSearchtext] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");

  const handleNext = () => {
    if (stepIndex === steps.length - 1) {
      saveActivityToDb(filename, selectedActivity, description)
        .then((response) => {
          dispatch(setSnackbarOpen(true));
          dispatch(setSnackbarMessage(response));
          closeDialog();
        })
        .catch((error) => console.error(error));
    } else {
      setStepIndex((prev) => prev.stepIndex + 1);
    }
  };

  const handlePrev = () => {
    setStepIndex((prev) => prev.stepIndex - 1);
  };

  const closeDialog = () => {
    setStepIndex(0);
    setFilename("");
    setDescription("");
    setSearchtext("");
    setSelectedActivity("");
    dispatch(setSnackbarMessage(""));
    onCancel();
  };

  const tableColumns = [
    {
      id: "category",
      label: "category",
      width: 269,
      Cell: ({ value }) => <Typography>{value}</Typography>,
    },
    {
      id: "activity",
      label: "activity",
      width: 290,
      Cell: ({ value }) => <Typography>{value}</Typography>,
    },
  ];

  const isNextDisabled =
    (stepIndex === 0 && selectedActivity === "") ||
    (stepIndex === 1 && filename === "");

  return (
    <Dialog open={true} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>{title[stepIndex]}</DialogTitle>
      <DialogContent>
        {stepIndex === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select an activity, then upload your raster file...
            </Typography>
            <MarxanTable
              data={activities}
              columns={tableColumns}
              searchColumns={["category", "activity"]}
              searchText={searchtext}
              selectedActivity={selectedActivity}
              getTrProps={(rowInfo) => ({
                style: {
                  background:
                    rowInfo.original.activity === selectedActivity
                      ? "rgb(0, 188, 212)"
                      : "",
                  color:
                    rowInfo.original.activity === selectedActivity
                      ? "white"
                      : "",
                },
                onClick: () => setSelectedActivity(rowInfo.original.activity),
              })}
            />
          </Box>
        )}
        {stepIndex === 1 && (
          <Box>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
              label="Enter activity description..."
              variant="outlined"
              margin="normal"
            />
            <FileUpload
              selectedActivity={selectedActivity}
              fileMatch={".tif"}
              mandatory={true}
              filename={filename}
              setFilename={() => setFilename(filename)}
              destFolder={"imports"}
              label="Select raster to upload..."
              style={{ paddingTop: "10px" }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={handlePrev}
          disabled={stepIndex === 0 || loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isNextDisabled || loading}
          startIcon={stepIndex === steps.length - 1 ? <SyncIcon /> : null}
        >
          {stepIndex === steps.length - 1 ? "Save Activity" : "Next"}
        </Button>
        <Button variant="text" onClick={closeDialog}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportActivityDialog;

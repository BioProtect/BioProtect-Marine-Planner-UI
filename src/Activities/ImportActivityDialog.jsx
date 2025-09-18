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
import { useDispatch, useSelector } from "react-redux";

import FileUpload from "../FileUpload";
import MarxanTable from "../MarxanTable";
import SyncIcon from "@mui/icons-material/Sync";
import useAppSnackbar from "@hooks/useAppSnackbar";

const title = ["Import Activity", "Upload Raster File"];

const ImportActivityDialog = ({
  onCancel,
  saveActivityToDb,
  activities,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui)
  const [steps, setSteps] = useState(["Select Activity", "Raster Upload"]);
  const [stepIndex, setStepIndex] = useState(0);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [searchtext, setSearchtext] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const { showMessage } = useAppSnackbar();

  const handleNext = () => {
    if (stepIndex === steps.length - 1) {
      saveActivityToDb(filename, selectedActivity, description)
        .then((response) => {
          showMessage(response, "success");
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
          disabled={stepIndex === 0 || uiState.loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isNextDisabled || uiState.loading}
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

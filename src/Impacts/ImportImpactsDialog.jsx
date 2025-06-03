import React, { useState } from "react";
import { setSnackbarMessage, setSnackbarOpen } from "../slices/uiSlice";

import FileUpload from "../FileUpload";
import MarxanDialog from "../MarxanDialog";
import MarxanTable from "../MarxanTable";
import MarxanTextField from "../MarxanTextField";
import Sync from "@mui/icons-material/Sync";
import TableRow from "../TableRow";
import ToolbarButton from "../ToolbarButton";
import { useDispatch } from "react-redux";

const INITIAL_STATE = {
  steps: ["Select Activity", "raster", "metadata"],
  title: [
    "Import Activity",
    "Upload File & Create Pressures",
    "Run Cumulative Impact",
  ],
};

const ImportImpactsDialog = (props) => {
  const dispatch = useDispatch();
  const [stepIndex, setStepIndex] = useState(0);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");

  const { steps, title } = INITIAL_STATE;

  const handleNext = () => {
    if (stepIndex === steps.length - 1) {
      importImpacts();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => setStepIndex(stepIndex - 1);

  const importImpacts = () => {
    props
      .importImpacts(filename, selectedActivity, description)
      .then((response) => {

        dispatch(setSnackbarMessage(response));
        dispatch(setSnackbarOpen(true))
        closeDialog();
      });
  };

  const closeDialog = () => {
    // Reset state
    setStepIndex(0);
    setFilename("");
    setDescription("");
    setSearchText("");
    setSelectedActivity("");
    dispatch(setSnackbarMessage(""));
    props.onCancel();
  };

  const renderActivity = (row) => <TableRow title={row.original.activity} />;
  const renderCategory = (row) => <TableRow title={row.original.category} />;

  const tableColumns = [
    {
      id: "category",
      accessor: "category",
      width: 269,
      headerStyle: { textAlign: "left" },
      Cell: renderCategory,
    },
    {
      id: "activity",
      accessor: "activity",
      width: 290,
      headerStyle: { textAlign: "left" },
      Cell: renderActivity,
    },
  ];

  // Determine if Next/Finish button should be disabled
  const isNextDisabled =
    (stepIndex === 0 && !selectedActivity) ||
    (stepIndex === 1 && !filename) ||
    (stepIndex === 2 && (!filename || !description));

  return (
    <MarxanDialog
      {...props}
      onOk={closeDialog}
      okLabel={"Cancel"}
      title={title[stepIndex]}
      showSearchBox={true}
      searchTextChanged={setSearchText}
      actions={
        <div
          key="actions"
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "auto",
            textAlign: "center",
          }}
        >
          <div
            style={{ margin: "0 16px", marginTop: 12 }}
            key={`action-buttons-${stepIndex}`}
          >
            <ToolbarButton
              key={`back-button-${stepIndex}`}
              label="Back"
              disabled={stepIndex === 0 || props.loading}
              onClick={handlePrev}
            />
            <ToolbarButton
              key={`next-button-${stepIndex}`}
              label={
                stepIndex === steps.length - 1
                  ? "Start Cumulative Impact"
                  : "Next"
              }
              onClick={handleNext}
              disabled={isNextDisabled || props.loading}
              primary={true}
            />
          </div>
        </div>
      }
      onClose={closeDialog}
      helpLink={"user.html#importing-from-a-shapefile"}
    >
      {stepIndex === 0 && (
        <div id="activityTable" key="activity-table">
          <h4>Select an activity then upload your raster file...</h4>
          <MarxanTable
            data={props.activities}
            columns={tableColumns}
            searchColumns={["category", "activity"]}
            searchText={searchText}
            selectedActivity={selectedActivity}
            getTrProps={(state, rowInfo) => ({
              style: {
                background:
                  rowInfo.original.activity === selectedActivity
                    ? "rgb(0, 188, 212)"
                    : "",
                color:
                  rowInfo.original.activity === selectedActivity ? "white" : "",
              },
              onClick: () => setSelectedActivity(rowInfo.original.activity),
            })}
            getTdProps={(state, rowInfo) => ({
              onClick: () => setSelectedActivity(rowInfo.original.activity),
            })}
          />
        </div>
      )}
      {stepIndex === 1 && (
        <FileUpload
          key={`file-upload-${stepIndex}`}
          {...props}
          selectedActivity={selectedActivity}
          fileMatch={".tif"}
          mandatory={true}
          filename={filename}
          setFilename={setFilename}
          destFolder={"imports"}
          label="Raster"
          style={{ paddingTop: "10px" }}
        />
      )}
      {stepIndex === 2 && (
        <>
          <div key={`running-impact-message-${stepIndex}`}>
            {props.runningImpactMessage}
            <Sync
              className="spin"
              style={{
                display:
                  props.loading || props.showSpinner ? "inline-block" : "none",
                color: "rgb(255, 64, 129)",
                top: "15px",
                right: "41px",
                height: "22px",
                width: "22px",
              }}
            />
          </div>
          <MarxanTextField
            key={`filename-textfield-${stepIndex}`}
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            floatingLabelText="Enter a name"
          />
          <MarxanTextField
            key={`description-textfield-${stepIndex}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiLine={true}
            rows={2}
            floatingLabelText="Enter a description"
          />
        </>
      )}
    </MarxanDialog>
  );
};

export default ImportImpactsDialog;

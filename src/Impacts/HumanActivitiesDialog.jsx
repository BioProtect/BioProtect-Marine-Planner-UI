import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import Button from "@mui/material/Button";
import FileUpload from "../Uploads/FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "../MarxanDialog";
import MarxanTextField from "../MarxanTextField";
import Sync from "@mui/icons-material/Sync";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { generateTableCols } from "../Helpers";
import { toggleDialog } from "../slices/uiSlice";

// Initial state configuration
const INITIAL_STATE = {
  steps: ["Select Activity", "Import or Draw", "Upload Data"],
  title: ["Select Activity", "Import or Draw", "Upload Data"],
};

const ImportImpactsDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );
  const planningGridDialogStates = useSelector(
    (state) => state.ui.planningGridDialogStates
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [message, setMessage] = useState("");

  const handleNext = () => {
    if (stepIndex === INITIAL_STATE.steps.length - 1) {
      saveActivityToDb();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => {
    setStepIndex(stepIndex - 1);
  };

  const saveActivityToDb = () => {
    props
      .saveActivityToDb(filename, selectedActivity, description)
      .then((response) => {
        setMessage(response);
        closeDialog();
        props.openImportedActivitesDialog();
      });
  };

  const clickRow = (evt, rowInfo) => {
    console.log("rowInfo ", rowInfo);
    setSelectedActivity(rowInfo)

  }



  const closeDialog = () => {
    setStepIndex(0);
    setFilename("");
    setDescription("");
    setSearchText("");
    setSelectedActivity("");
    setMessage("");
    dispatch(
      toggleDialog({ dialogName: "humanActivitiesDialogOpen", isOpen: false })
    );
  };

  const tableColumns = generateTableCols([
    { id: "category", label: "category" },
    { id: "activity", label: "activity" },
  ]);

  const isNextDisabled = () => {
    if (stepIndex === 0) return selectedActivity === "";
    if (stepIndex === 1) return filename === "";
    return false;
  };

  const actions = (
    <div style={{ margin: "0 16px" }}>
      {stepIndex !== 1 && (
        <div style={{ marginTop: 12 }}>
          <Button
            label="Back"
            disabled={stepIndex === 0 || props.loading}
            onClick={handlePrev}
          />
          <Button
            label={
              stepIndex === INITIAL_STATE.steps.length - 1
                ? "Save to Database"
                : "Next"
            }
            onClick={handleNext}
            disabled={
              isNextDisabled() ||
              props.loading ||
              (stepIndex === 2 && (filename === "" || description === ""))
            }
            primary={true}
          />
        </div>
      )}
    </div>
  );

  return (
    <MarxanDialog
      loading={props.loading}
      open={dialogStates.humanActivitiesDialogOpen}
      onOk={() => closeDialog()}
      onClose={() => closeDialog()}
      okLabel={"Cancel"}
      title={INITIAL_STATE.title[stepIndex]}
      showSearchBox={true}
      searchTextChanged={setSearchText}
      actions={actions}
      helpLink={"user.html#importing-from-a-shapefile"}
    >
      {stepIndex === 0 && (
        <div id="activityTable">
          <BioprotectTable
            title="Select an activity then upload your raster file"
            data={props.activities}
            tableColumns={tableColumns}
            ableToSelectAll={false}
            searchColumns={["category", "activity"]}
            searchText={searchText}
            selected={[selectedActivity]}
            clickRow={clickRow}

          />
        </div>
      )}
      {stepIndex === 1 && (
        <div>
          <Button
            show={props.userRole !== "ReadOnly" && !props.metadata.OLDVERSION}
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="Import"
            disabled={props.loading}
            onClick={handleNext}
          >
            Import from Raster
          </Button>
          <Button
            show={props.userRole !== "ReadOnly" && !props.metadata.OLDVERSION}
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
          <div>
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
          <FileUpload
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
          <MarxanTextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiLine={true}
            rows={2}
            floatingLabelText="Enter a description"
          />
        </div>
      )}
    </MarxanDialog>
  );
};

export default ImportImpactsDialog;

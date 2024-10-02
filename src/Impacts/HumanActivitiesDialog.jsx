import React, { useState } from "react";

import BioprotectTable from "../BPComponents/BioprotectTable";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FileUpload from "../Uploads/FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HumanActivitiesTable from "../HumanActivitiesTable";
import MarxanDialog from "../MarxanDialog";
import MarxanTable from "../MarxanTable";
import MarxanTextField from "../MarxanTextField";
import Sync from "@mui/icons-material/Sync";
import TableRow from "../TableRow";
import ToolbarButton from "../ToolbarButton";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

// Initial state configuration
const INITIAL_STATE = {
  steps: ["Select Activity", "Import or Draw", "Upload Data"],
  title: ["Select Activity", "Import or Draw", "Upload Data"],
};

const ImportImpactsDialog = (props) => {
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

  const closeDialog = () => {
    setStepIndex(0);
    setFilename("");
    setDescription("");
    setSearchText("");
    setSelectedActivity("");
    setMessage("");
    props.onCancel();
  };

  const tableColumns = [
    {
      id: "category",
      numeric: false,
      disablePadding: true,
      label: "category",
    },
    {
      id: "activity",
      numeric: false,
      disablePadding: true,
      label: "activity",
    },
  ];

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
      {...props}
      onOk={closeDialog}
      okLabel={"Cancel"}
      bodyStyle={{ padding: "0px 24px 0px 24px" }}
      title={INITIAL_STATE.title[stepIndex]}
      showSearchBox={true}
      searchTextChanged={setSearchText}
      actions={actions}
      onClose={closeDialog}
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
            selectedActivity={selectedActivity}
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

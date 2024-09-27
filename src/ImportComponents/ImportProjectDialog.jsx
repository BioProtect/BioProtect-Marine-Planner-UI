import React, { useState } from "react";

import MarxanDialog from "../MarxanDialog";
import Metadata from "../Metadata";
import ToolbarButton from "../ToolbarButton";
import UploadMarxanFiles from "../Uploads/UploadMarxanFiles";

const ImportProjectDialog = (props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zipFilename, setZipFilename] = useState("");
  const [files, setFiles] = useState([]);
  const [planningGridName, setPlanningGridName] = useState("");

  const steps = ["Files and planning grid", "Info"];

  const handleNext = () => {
    if (stepIndex === 1) {
      setLoading(true);
      props
        .importProject(name, description, zipFilename, files, planningGridName)
        .then(() => onOk())
        .catch((error) => {
          setLoading(false);
          props.log(error + "Import stopped");
          props.setSnackBar(error);
        });
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const filesListed = (listedFiles) => {
    // TODO: filter the files to exclude output files - these are unnecessary and will be creating on the first run anyway
    setFiles(listedFiles);
  };

  const onOk = () => {
    setLoading(false);
    setStepIndex(0);
    props.onOk();
  };

  return (
    <MarxanDialog
      {...props}
      open={props.open}
      title={"Import Marxan DOS project"}
      fullWidth={true}
      onOk={onOk}
      onCancel={onOk}
      showCancelButton={true}
      autoDetectWindowHeight={false}
      helpLink={"user.html#importing-marxan-dos-projects"}
      modal={true}
      actions={[
        <ToolbarButton
          key="ipd1"
          label="Back"
          disabled={stepIndex === 0}
          onClick={handlePrev}
        />,
        <ToolbarButton
          key="ipd1"
          label={stepIndex === steps.length - 1 ? "Finish" : "Next"}
          onClick={handleNext}
          primary={true}
          disabled={
            loading ||
            (stepIndex === 0 &&
              (files.length === 0 ||
                zipFilename === "" ||
                planningGridName === "")) ||
            (stepIndex === 1 && (name === "" || description === ""))
          }
        />,
      ]}
    >
      {stepIndex === 0 ? (
        <UploadMarxanFiles
          {...props}
          filesListed={filesListed}
          setZipFilename={setZipFilename}
          setPlanningGridName={(e, value) => setPlanningGridName(value)}
          planning_grid_name={planningGridName}
        />
      ) : null}
      {stepIndex === 1 && (
        <Metadata
          name={name}
          description={description}
          setName={setName}
          setDescription={setDescription}
        />
      )}
    </MarxanDialog>
  );
};

export default ImportProjectDialog;

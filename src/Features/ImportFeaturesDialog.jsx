import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FileUpload from "../Uploads/FileUpload";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { setAddToProject } from "../slices/projectSlice";
import { setFeatureDatasetFilename } from "../slices/uiSlice";
import { toggleFeatureD } from "../slices/featureSlice";

const ImportFeaturesDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const projState = useSelector((state) => state.project);
  const featureState = useSelector((state) => state.feature)
  const [steps, setSteps] = useState([
    "shapefile",
    "single_or_multiple",
    "metadata",
  ]);
  const [stepIndex, setStepIndex] = useState(0);
  const [fieldNames, setFieldNames] = useState([]);
  const [splitField, setSplitField] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shapeFile, setShapeFile] = useState(null);

  const handleNext = () => {
    if (stepIndex === 0) {
      props.unzipShapefile(uiState.featureDatasetFilename).then((response) => {
        setShapeFile(`${response.rootfilename}.shp`);
        setStepIndex(stepIndex + 1);
      });
    } else if (stepIndex === steps.length - 1) {
      importFeatures();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => setStepIndex(stepIndex - 1);
  const handleNameChange = (event) => setName(event.target.value);
  const handleDescriptionChange = (event) => setDescription(event.target.value);
  const handleSplitFieldChange = (event) => setSplitField(event.target.value);
  const resetFieldnames = () => setFieldNames([]);

  const getShapefileFieldnames = () => {
    props.getShapefileFieldnames(shapeFile).then((response) => {
      setFieldNames(response.fieldnames);
    });
  };

  const importFeatures = () => {
    props
      .importFeatures(uiState.featureDatasetFilename, name, description, shapeFile, splitField)
      .then(() => {
        closeDialog();
      });
  };

  const handleAddToProjectChange = (evt) => dispatch(setAddToProject(evt.target.checked));

  const closeDialog = () => {
    if (shapeFile) {
      props.deleteShapefile(uiState.featureDatasetFilename, shapeFile);
    }
    setStepIndex(0);
    setFieldNames([]);
    setSplitField("");
    setName("");
    setDescription("");
    setShapeFile(null);
    dispatch(setFeatureDatasetFilename(""));
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: true,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "importFeaturesDialogOpen",
        isOpen: false,
      })
    );
  };

  const _disabled =
    (stepIndex === 0 && uiState.featureDatasetFilename === "") ||
    (stepIndex === 1 && props.loading);

  return (
    <Dialog
      open={featureState.dialogs.importFeaturesDialogOpen}
      onClose={closeDialog}
      onCancel={() => closeDialog()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Import Features</DialogTitle>
      <DialogContent>
        {stepIndex === 0 && (
          <FileUpload
            loading={props.loading}
            fileUpload={props.fileUpload}
            fileMatch=".zip"
            mandatory={true}
            filename={uiState.featureDatasetFilename}
            destFolder="imports"
            label="Shapefile"
          />
        )}
        {stepIndex === 1 && (
          <RadioGroup name="createFeatureType" defaultValue="single">
            <FormControlLabel
              value="single"
              control={<Radio />}
              label="Create single feature"
              onClick={resetFieldnames}
            />
            <FormControlLabel
              value="multiple"
              control={<Radio />}
              label="Split into multiple features"
              onClick={getShapefileFieldnames}
            />
          </RadioGroup>
        )}
        {stepIndex === 2 && (
          <>
            {fieldnames.length === 0 ? (
              <>
                <TextField
                  fullWidth
                  value={name}
                  onChange={handleNameChange}
                  label="Enter a name"
                  margin="dense"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  value={description}
                  onChange={handleDescriptionChange}
                  label="Enter a description"
                  multiline
                  rows={2}
                  margin="dense"
                  variant="outlined"
                />
              </>
            ) : (
              <Select
                fullWidth
                value={splitField}
                onChange={handleSplitFieldChange}
                displayEmpty
                inputProps={{ "aria-label": "Split features by" }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {fieldnames.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={projState.addToProject}
                  onChange={handleAddToProjectChange}
                />
              }
              label="Add to project"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handlePrev}
          disabled={stepIndex === 0 || props.loading}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            _disabled ||
            (stepIndex === 2 &&
              fieldnames.length === 0 &&
              (name === "" || description === "")) ||
            (stepIndex === 2 && fieldnames.length !== 0 && splitField === "")
          }
        >
          {stepIndex === steps.length - 1 ? "Finish" : "Next"}
        </Button>
        <Button onClick={closeDialog} color="error">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFeaturesDialog;

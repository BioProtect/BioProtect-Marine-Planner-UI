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
import { setFeatureDatasetFilename } from "../slices/featureSlice";
import { toggleFeatureD } from "../slices/featureSlice";

const ImportFeaturesDialog = ({
  importFeatures,
  loading,
  fileUpload,
  unzipShapefile,
  getShapefileFieldnames,
  deleteShapefile,
}) => {
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
      unzipShapefile(featureState.featureDatasetFilename).then((response) => {
        setShapeFile(`${response.rootfilename}.shp`);
        setStepIndex(stepIndex + 1);
      });
    } else if (stepIndex === steps.length - 1) {
      importFeatures(featureState.featureDatasetFilename, name, description, shapeFile, splitField)
        .then(() => {
          closeDialog();
        });
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => setStepIndex(stepIndex - 1);
  const handleNameChange = (event) => setName(event.target.value);
  const handleDescriptionChange = (event) => setDescription(event.target.value);
  const handleSplitFieldChange = (event) => setSplitField(event.target.value);
  const resetFieldnames = () => setFieldNames([]);

  const handleGetShapefileFieldnames = () => {
    getShapefileFieldnames(shapeFile).then((response) => {
      setFieldNames(response.fieldnames);
    });
  };

  const handleAddToProjectChange = (evt) => dispatch(setAddToProject(evt.target.checked));

  const closeDialog = () => {
    if (shapeFile) {
      deleteShapefile(featureState.featureDatasetFilename, shapeFile);
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
    (stepIndex === 0 && featureState.featureDatasetFilename === "") ||
    (stepIndex === 1 && loading);

  return (
    <Dialog
      open={featureState.dialogs.importFeaturesDialogOpen}
      onClose={closeDialog}
      onCancel={() => closeDialog()}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Import Features</DialogTitle>
      <DialogContent>
        {stepIndex === 0 && (
          <FileUpload
            loading={loading}
            fileUpload={fileUpload}
            fileMatch=".zip"
            mandatory={true}
            filename={featureState.featureDatasetFilename}
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
              onClick={() => handleGetShapefileFieldnames()}
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
          disabled={stepIndex === 0 || loading}
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

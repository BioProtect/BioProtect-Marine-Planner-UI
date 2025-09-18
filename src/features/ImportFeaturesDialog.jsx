import React, { useCallback, useState } from "react";
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
import { addToImportLog } from "../slices/uiSlice";
import { setAddToProject } from "@slices/projectSlice";
import { setFeatureFilename } from "@slices/featureSlice";
import { toggleFeatureD } from "@slices/featureSlice";
import { useLogToSnackbar } from "@hooks/useLogToSnackbar";

const ImportFeaturesDialog = ({
  importFeatures,
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
  const [fieldnames, setFieldNames] = useState([]);
  const [splitField, setSplitField] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shapeFile, setShapeFile] = useState(null);
  const [importLog, setImportLog] = useState([]);

  useLogToSnackbar(() => true);

  const handleNext = () => {
    if (stepIndex === 0) {
      unzipShapefile(featureState.featureFilename).then((response) => {
        const shapeFilePath = response.rootfilename;
        setShapeFile(`${shapeFilePath}.shp`);
        setName(`${shapeFilePath}`)
        setStepIndex(stepIndex + 1);
        handleGetShapefileFieldnames(`${shapeFilePath}.shp`);
      });
    } else if (stepIndex === steps.length - 1) {
      importFeatures(featureState.featureFilename, name, description, shapeFile, splitField).then((response) => {
        dispatch(addToImportLog(response.message));
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

  const handleGetShapefileFieldnames = (shapeFilePath) => {
    if (shapeFilePath === undefined) {
      shapeFilePath = shapeFile;
    }
    getShapefileFieldnames(shapeFilePath).then((response) => {
      const { info, fieldnames, values } = response;
      console.log("fieldnames, values ", fieldnames, values);
      setFieldNames(fieldnames);

      const descriptField = fieldnames.find((name) =>
        name.toLowerCase().includes("descript")
      );

      if (descriptField && values?.length > 0) {
        const value = values[0][descriptField];
        console.log("value ", value);
        if (value) {
          setDescription(value);
        }
      }
    });
  };

  const handleAddToProjectChange = (evt) => dispatch(setAddToProject(evt.target.checked));

  const closeDialog = () => {
    if (shapeFile) {
      deleteShapefile(featureState.featureFilename, shapeFile);
    }
    setStepIndex(0);
    setFieldNames([]);
    setSplitField("");
    setName("");
    setDescription("");
    setShapeFile(null);
    dispatch(setFeatureFilename(""));
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
    (stepIndex === 0 && featureState.featureFilename === "") ||
    (stepIndex === 1 && uiState.loading);

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
            loading={uiState.loading}
            fileUpload={fileUpload}
            fileMatch=".zip"
            mandatory={true}
            filename={featureState.featureFilename}
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
              onClick={() => resetFieldnames()}
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
                  onChange={(e) => handleNameChange(e)}
                  label="Enter a name"
                  margin="dense"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  value={description}
                  onChange={(e) => handleDescriptionChange(e)}
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
                onChange={(e) => handleSplitFieldChange(e)}
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
                  onChange={(e) => handleAddToProjectChange(e)}
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
          disabled={stepIndex === 0 || uiState.loading}
        >
          Back
        </Button>
        <Button
          onClick={() => handleNext()}
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

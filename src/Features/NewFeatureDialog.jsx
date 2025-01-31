import React, { useState } from "react";
import {
  setActiveResultsTab,
  setActiveTab,
  setSnackbarMessage,
  setSnackbarOpen,
  toggleDialog,
  togglePUD,
  toggleProjectDialog,
} from "../slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import { setAddToProject } from "../slices/projectSlice";
import { useCreateFeatureFromLinestringMutation } from "../slices/featureSlice";

// Functional component version using React 18 and MUI 5
const NewFeatureDialog = ({ loading, newFeatureCreated }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const projState = useSelector((state) => state.project);
  const featureState = useSelector((state) => state.feature);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [createFeatureFromLine, { isLoading: isCreating }] = useCreateFeatureFromLinestringMutation();

  // State for name and description
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Handlers for state changes
  const handleNameChange = (event) => setName(event.target.value);
  const handleDescriptionChange = (event) => setDescription(event.target.value);

  const convertCoordinatesToLineString = (coordinates) => {
    return coordinates[0]
      .map((coordinate) => `${coordinate[0]} ${coordinate[1]}`)
      .join(",");
  };

  const createNewFeature = async () => {
    try {
      startLogging();
      messageLogger({
        method: "createNewFeature",
        status: "Started",
        info: "Creating feature..",
      });

      if (!featureState.digitisedFeatures || featureState.digitisedFeatures.length === 0) {
        throw new Error("No digitized features available.");
      }

      // Convert coordinates into a PostGIS-compatible LINESTRING
      const coords = convertCoordinatesToLineString(featureState.digitisedFeatures[0].geometry.coordinates);
      const linestring = `Linestring(${coords})`;

      // Prepare the form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("linestring", linestring);

      // Send the request to create the feature
      const createdFeatureData = await createFeatureFromLine(formData).unwrap();

      // Log success message
      messageLogger({
        method: "createNewFeature",
        status: "Finished",
        info: createdFeatureData.info,
      });

      // Poll Mapbox for completion
      const mbResponse = await pollMapbox(createdFeatureData.uploadId);
      await newFeatureCreated(mbResponse.id);

      // Close the dialog & clean up the map controls
      dispatch(toggleFeatureD({ dialogName: "newFeatureDialogOpen", isOpen: false }));
      map.current.removeControl(mapboxDrawControls);
    } catch (error) {
      console.error("Error creating feature:", error);
      messageLogger({
        method: "createNewFeature",
        status: "Error",
        info: error.message || "Failed to create feature.",
      });
    }
  };


  const handleAddToProjectChange = (evt) => dispatch(setAddToProject(evt.target.checked));

  const closeDialog = () => {
    dispatch(
      toggleFeatureD({ dialogName: "newFeatureDialogOpen", isOpen: false })
    );
    map.current.removeControl(mapboxDrawControls);
  }

  return (
    <Dialog
      open={featureState.dialogs.newFeatureDialogOpen}
      onOkay={() => closeDialog()}
      onClose={() => closeDialog()}
      aria-labelledby="create-new-feature-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="create-new-feature-dialog-title">
        Create new feature
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
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
        </FormControl>
        <FormControlLabel
          control={<Checkbox checked={projState.addToProject} />}
          label="Add to Project"
          onChange={handleAddToProjectChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="error" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={createNewFeature}
          color="primary"
          variant="contained"
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewFeatureDialog;

import React, { useState } from "react";
import {
  setActiveResultsTab,
  setActiveTab,
  setSnackbarMessage,
  setSnackbarOpen,
  toggleDialog,
  toggleFeatureDialog,
  togglePlanningGridDialog,
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

// Functional component version using React 18 and MUI 5
const NewFeatureDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const projState = useSelector((state) => state.project);
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
  // State for name and description
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Handlers for state changes
  const handleNameChange = (event) => setName(event.target.value);
  const handleDescriptionChange = (event) => setDescription(event.target.value);

  // Creating the new feature based on name and description
  const handleCreateNewFeature = () => {
    console.log("clicked");
    props.createNewFeature(name, description);
  };

  const handleAddToProjectChange = (evt) => dispatch(setAddToProject(evt.target.checked));

  return (
    <Dialog
      open={featureDialogStates.newFeatureDialogOpen}
      onOkay={props.closeNewFeatureDialog}
      onClose={props.closeNewFeatureDialog}
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
        <Button onClick={props.onCancel} color="error" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleCreateNewFeature}
          color="primary"
          variant="contained"
        // disabled={
        //   !(name !== "" && description !== "" && props.loading === false)
        // }
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewFeatureDialog;

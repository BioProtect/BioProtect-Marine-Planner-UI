import React, { useState } from "react";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";

// Functional component version using React 18 and MUI 5
const NewFeatureDialog = (props) => {
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

  const handleAddToProjectChange = (evt) => {
    this.props.setAddToProject(evt.target.checked);
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onCancel}
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
          control={<Checkbox checked={props.addToProject} />}
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

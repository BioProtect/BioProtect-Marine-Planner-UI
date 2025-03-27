import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";

import PropTypes from "prop-types";
import { selectCurrentUser } from "../slices/authSlice";
import { useSelector } from "react-redux";

const ProfileDialog = ({ open, onOk, updateUser }) => {
  const userData = useSelector(selectCurrentUser);

  const [state, setState] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    updated: false,
    validEmail: true,
  });

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleUpdateUser();
    }
  };

  const handleStateUpdate = (name, value) => {
    setState((prevState) => ({
      ...prevState,
      [name]: value,
      updated: true,
    }));
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(String(state.email).toLowerCase());
    setState((prevState) => ({ ...prevState, validEmail: isValid }));
    return isValid;
  };

  const handleUpdateUser = () => {
    if (!validateEmail()) {
      return; // Exit if email is invalid
    }
    updateUser({ name: state.name, email: state.email });
    handleClose();
  };

  const handleClose = () => {
    onOk(); // Call parent-provided close function
    setState({
      name: userData?.name || "",
      email: userData?.email || "",
      updated: false,
      validEmail: true,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Profile</DialogTitle>
      <DialogContent>
        <TextField
          label="Full Name"
          fullWidth
          variant="outlined"
          margin="normal"
          value={state.name}
          onChange={(e) => handleStateUpdate("name", e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <TextField
          label="Email Address"
          fullWidth
          variant="outlined"
          margin="normal"
          value={state.email}
          error={!state.validEmail}
          helperText={state.validEmail ? "" : "Invalid email address"}
          onChange={(e) => handleStateUpdate("email", e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <div style={{ marginTop: "1rem" }}>Role: {userData?.ROLE || "Unknown"}</div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleUpdateUser} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;

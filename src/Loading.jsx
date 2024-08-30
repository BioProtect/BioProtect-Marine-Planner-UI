import BioProtectLogo from "./images/bioprotect_project_logo.jpeg";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import { DialogContentText } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import Typography from "@mui/material/Typography";

const Loading = () => {
  return (
    <Dialog
      fullWidth={false}
      maxWidth="sm"
      component="form"
      noValidate
      open={open}
    >
      <DialogTitle>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CardMedia>
            <img
              srcSet={`${BioProtectLogo}`}
              src={`${BioProtectLogo}`}
              alt="bioprotect logo"
              loading="lazy"
            />
          </CardMedia>
        </div>
      </DialogTitle>
      <DialogContentText>
        <Typography variant="h1" component="h2">
          Loading...
        </Typography>
      </DialogContentText>
    </Dialog>
  );
};

export default Loading;

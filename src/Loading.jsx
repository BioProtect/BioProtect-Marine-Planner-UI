import BioProtectLogo from "./images/bioprotect_project_logo.jpeg";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
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
      open={true}
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
      <DialogContentText align="center" variant="h2">
        Loading...
      </DialogContentText>
    </Dialog>
  );
};

export default Loading;

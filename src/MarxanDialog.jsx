import React, { useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

const DOCS_ROOT = "https://docs.marxanweb.org/";

//properties can be:
// contentWidth - the width of the content area
// offsetX - the distance from the left edge (mutually exclusive with rightX)
// rightX - the distance from the right edge (mutually exclusive with offsetX)
// offsetY - the distance from the top
// onOk - fired when the OK button is clicked
// onCancel - fired when the Cancel button is clicked or when the dialog needs to be closed
// showCancelButton - set to true to show the cancel button
// actions - an array of components to add to the actions array in the dialog
// helpLink - a relative url to the bookmark in the user documentation that describes the particular dialog box
// showSearchBox - true to show a search box

const MarxanDialog = (props) => {
  const fullW = props.fullWidth ? props.fullWidth : false;
  const maxW = props.maxWidth ? props.maxWidth : "lg";
  const openDocumentation = () => {
    window.open(DOCS_ROOT + props.helpLink);
  };

  const searchTextChange = (evt) => {
    props.setSearchText(evt.target.value);
  };

  return (
    <Dialog
      open={props.open}
      fullWidth={fullW}
      maxWidth={maxW}
      onClose={props.onCancel}
    >
      <DialogContent>{props.children}</DialogContent>
      <DialogActions key={`dialog-actions-${props.title}`}>
        {props.actions}
      </DialogActions>
      <DialogActions key={`dialog-actions-${props.title}2`}>
        {props.showCancelButton ? (
          <Button
            key="cancel-button"
            variant="outlined"
            onClick={props.onCancel}
            color="error"
          >
            {props.cancelLabel ? props.cancelLabel : "Cancel"}
          </Button>
        ) : null}
        {props.hideOKButton ? null : (
          <Button
            key="ok-button"
            variant="outlined"
            onClick={props.onOk}
            disabled={props.okDisabled}
          >
            {props.okLabel ? props.okLabel : "OK"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MarxanDialog;

/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useState } from "react";
import { faQuestionCircle, faSearch } from "@fortawesome/free-solid-svg-icons";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import Sync from "@mui/icons-material/Sync";
import TextField from "@mui/material/TextField";

const DOCS_ROOT = "https://docs.marxanweb.org/";

//properties can be:
//contentWidth - the width of the content area
//offsetX - the distance from the left edge (mutually exclusive with rightX)
//rightX - the distance from the right edge (mutually exclusive with offsetX)
//offsetY - the distance from the top
//onOk - fired when the OK button is clicked
//onCancel - fired when the Cancel button is clicked or when the dialog needs to be closed
//showCancelButton - set to true to show the cancel button
//actions - an array of components to add to the actions array in the dialog
//helpLink - a relative url to the bookmark in the user documentation that describes the particular dialog box
//showSearchBox - true to show a search box

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

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
import SearchField from "./SearchField";
import Sync from "@mui/icons-material/Sync";

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
  const [searchText, setSearchText] = useState("");
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState("sm");

  const openDocumentation = () => {
    window.open(DOCS_ROOT + props.helpLink);
  };

  const searchTextChange = (evt) => {
    setSearchText(evt.target.value);
    if (props.searchTextChanged) props.searchTextChanged(evt.target.value);
  };

  const clearSearch = () => {
    searchTextChange({ target: { value: "" } });
  };

  const cancelButton = props.showCancelButton ? (
    <Button variant="outlined" primary={true} onClick={props.onCancel}>
      {props.cancelLabel ? props.cancelLabel : "Cancel"}
    </Button>
  ) : null;

  const okButton = props.hideOKButton ? null : (
    <Button variant="outlined" onClick={props.onOk} disabled={props.okDisabled}>
      {props.okLabel ? props.okLabel : "OK"}
    </Button>
  );

  const actions = [props.actions, cancelButton, okButton];

  return (
    <Dialog
      {...props}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      onClose={props.onCancel}
    >
      <DialogTitle position="static">
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={4}>
            {props.title ? props.title : null}
          </Grid>
          <Grid item xs={8}>
            {[
              props.titleBarIcon ? (
                <FontAwesomeIcon
                  icon={props.titleBarIcon}
                  key="k1"
                  style={{ position: "absolute", top: "18px", left: "24px" }}
                />
              ) : null,
              props.showSearchBox ? (
                <SearchField
                  value={searchText}
                  onChange={searchTextChange}
                  key="k27"
                ></SearchField>
              ) : null,

              <Sync
                className="spin"
                style={{
                  display:
                    props.loading || props.showSpinner
                      ? "inline-block"
                      : "none",
                  color: "rgb(255, 64, 129)",
                  position: "absolute",
                  top: "15px",
                  right: "41px",
                  height: "22px",
                  width: "22px",
                }}
                key={"spinner"}
              />,
              props.helpLink ? (
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  onClick={openDocumentation}
                  title={"Open documentation for this window"}
                  className={"appBarIcon docs"}
                  key="helpLink"
                />
              ) : null,
            ]}
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

export default MarxanDialog;

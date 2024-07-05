/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import * as React from "react";

import CONSTANTS from "../constants";
import FileUpload from "../FileUpload";
import MarxanDialog from "../MarxanDialog";
import MarxanTextField from "../MarxanTextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

class NewPlanningGridDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filename: "",
      planningGridName: "",
      shape: "",
      areakm2: undefined,
      domainEnabled: true,
    };
  }
  changeShape(evt, value) {
    this.setState({ shape: CONSTANTS.SHAPES[value] });
  }
  changeAreaKm2(evt, value) {
    this.setState({ areakm2: CONSTANTS.AREAKM2S[value] });
  }
  changeName(event, newValue) {
    this.setState({ planningGridName: newValue });
  }
  setFilename(filename) {
    this.setState({ filename: filename });
  }
  onOk() {
    //create the new planning grid
    this.props
      .createNewPlanningUnitGrid(
        this.state.filename,
        this.state.planningGridName,
        this.state.areakm2,
        this.state.shape
      )
      .then(
        function (response) {
          //close the dialog
          this.props.onCancel();
        }.bind(this)
      );
  }
  render() {
    let dropDownStyle = { width: "240px" };
    return (
      <MarxanDialog
        {...this.props}
        onOk={this.onOk.bind(this)}
        onClose={this.props.onCancel}
        okDisabled={!this.state.areakm2 || this.props.loading}
        cancelLabel={"Cancel"}
        showCancelButton={true}
        helpLink={"user.html#creating-new-planning-grids-using-marxan-web"}
        title="New planning grid"
        contentWidth={358}
      >
        {
          <React.Fragment key="k13">
            <FileUpload
              {...this.props}
              fileMatch={".zip"}
              destFolder="data/tmp/"
              mandatory={true}
              filename={this.state.filename}
              setFilename={this.setFilename.bind(this)}
              label="Shapefile"
            />
            <MarxanTextField
              style={{ width: "310px" }}
              value={this.state.planningGridName}
              onChange={this.changeName.bind(this)}
              floatingLabelText="Name"
            />
            <div>
              <Select
                menuItemStyle={{ fontSize: "12px" }}
                labelStyle={{ fontSize: "12px" }}
                onChange={this.changeShape.bind(this)}
                value={this.state.shape}
                style={dropDownStyle}
                floatingLabelText="Planning unit shape"
                floatingLabelFixed={true}
              >
                {CONSTANTS.SHAPES.map((item) => {
                  return (
                    <MenuItem
                      style={{ fontSize: "12px" }}
                      value={item}
                      primaryText={item}
                      key={item}
                    />
                  );
                })}
              </Select>
            </div>
            <div>
              <Select
                menuItemStyle={{ fontSize: "12px" }}
                labelStyle={{ fontSize: "12px" }}
                onChange={this.changeAreaKm2.bind(this)}
                value={this.state.areakm2}
                style={dropDownStyle}
                floatingLabelText="Area of each planning unit"
                floatingLabelFixed={true}
              >
                {CONSTANTS.AREAKM2S.map((item) => {
                  return (
                    <MenuItem
                      style={{ fontSize: "12px" }}
                      value={item}
                      primaryText={item + " Km2"}
                      key={item}
                    />
                  );
                })}
              </Select>
            </div>
          </React.Fragment>
        }
      </MarxanDialog>
    );
  }
}

export default NewPlanningGridDialog;

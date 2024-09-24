/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import * as React from "react";

import Checkbox from "@mui/material/Checkbox";
import FileUpload from "../Uploads/FileUpload";
import MarxanDialog from "../MarxanDialog";
import MarxanTextField from "../MarxanTextField";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import ToolbarButton from "../ToolbarButton";

let INITIAL_STATE = {
  steps: ["shapefile", "single_or_multiple", "metadata"],
  stepIndex: 0,
  fieldnames: [],
  splitField: "",
  name: "",
  description: "",
};
class ImportFeaturesDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }
  handleNext() {
    const { stepIndex } = this.state;
    switch (stepIndex) {
      case 0:
        //unzip the shapefile on the server
        this.props.unzipShapefile(this.props.filename).then((response) => {
          //get the name of the shapefile in the zip file
          this.shapefile = response.rootfilename + ".shp";
          this.setState({ stepIndex: stepIndex + 1 });
        });
        break;
      case this.state.steps.length - 1:
        this.importFeatures();
        break;
      default:
        this.setState({ stepIndex: stepIndex + 1 });
    }
  }
  handlePrev() {
    const { stepIndex } = this.state;
    this.setState({ stepIndex: stepIndex - 1 });
  }
  changeName(event, newValue) {
    this.setState({ name: newValue });
  }
  changeDescription(event, newValue) {
    this.setState({ description: newValue });
  }
  changeSplitField(event, index) {
    this.setState({ splitField: this.state.fieldnames[index] });
  }
  getShapefileFieldnames() {
    //get the field names from the unzipped shapefile on the server
    this.props.getShapefileFieldnames(this.shapefile).then((response) => {
      //set the fieldnames in local state
      this.setState({ fieldnames: response.fieldnames });
    });
  }
  resetFieldnames() {
    this.setState({ fieldnames: [] });
  }
  importFeatures() {
    this.props
      .importFeatures(
        this.props.filename,
        this.state.name,
        this.state.description,
        this.shapefile,
        this.state.splitField
      )
      .then((response) => {
        this.closeDialog();
      });
  }

  setFilename(filename) {
    this.props.updateState({ featureDatasetFilename: filename });
  }

  closeDialog() {
    //delete the zip file and shapefile
    this.props.deleteShapefile(this.props.filename, this.shapefile);
    this.setState({ ...INITIAL_STATE });
    this.shapefile = "";
    this.props.updateState({
      featureDatasetFilename: "",
      importFeaturesDialogOpen: false,
    });
  }
  render() {
    let _disabled = false;
    const { stepIndex } = this.state;
    const contentStyle = { margin: "0 16px" };
    //get the disabled state for the next/finish button
    switch (stepIndex) {
      case 0:
        _disabled = this.props.filename === "";
        break;
      case 1:
        _disabled = this.props.loading;
        break;
      default:
      // code
    }
    const actions = [
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "auto",
          textAlign: "center",
        }}
        key="ifd1"
      >
        <div style={contentStyle} key="ifd2">
          <div style={{ marginTop: 12 }} key="ifd3">
            <ToolbarButton
              key="ifd4"
              label="Back"
              disabled={stepIndex === 0 || this.props.loading}
              onClick={this.handlePrev.bind(this)}
            />
            <ToolbarButton
              key="ifd5"
              label={
                stepIndex === this.state.steps.length - 1 ? "Finish" : "Next"
              }
              onClick={this.handleNext.bind(this)}
              disabled={
                _disabled ||
                this.props.loading ||
                (stepIndex === 2 &&
                  this.state.fieldnames.length === 0 &&
                  (this.state.name === "" || this.state.description === "")) ||
                (stepIndex === 2 &&
                  this.state.fieldnames.length !== 0 &&
                  this.state.splitField === "")
              }
              primary={true}
            />
          </div>
        </div>
      </div>,
    ];
    let children = (
      <div key="k12">
        {stepIndex === 0 ? (
          <div>
            <FileUpload
              {...this.props}
              fileMatch={".zip"}
              mandatory={true}
              filename={this.props.filename}
              setFilename={this.setFilename.bind(this)}
              destFolder={"imports"}
              label="Shapefile"
              style={{ paddingTop: "10px" }}
            />
          </div>
        ) : null}
        {stepIndex === 1 ? (
          <div>
            <RadioGroup name="createFeatureType" defaultSelected="single">
              <Radio
                className={"radioButton"}
                value="single"
                label="Create single feature"
                style={{ padding: "10px" }}
                onClick={this.resetFieldnames.bind(this)}
              />
              <Radio
                className={"radioButton"}
                value="multiple"
                label="Split into multiple features"
                style={{ padding: "10px" }}
                onClick={this.getShapefileFieldnames.bind(this)}
              />
            </RadioGroup>
          </div>
        ) : null}
        {stepIndex === 2 ? (
          this.state.fieldnames.length === 0 ? (
            <div>
              <MarxanTextField
                value={this.state.name}
                onChange={this.changeName.bind(this)}
                floatingLabelText="Enter a name"
              />
              <MarxanTextField
                value={this.state.description}
                onChange={this.changeDescription.bind(this)}
                multiLine={true}
                rows={2}
                floatingLabelText="Enter a description"
              />
              <Checkbox
                label="Add to project"
                style={{
                  fontSize: "12px",
                  width: "200px",
                  display: "inline-block",
                  marginTop: "10px",
                }}
                onCheck={this.props.setAddToProject}
                checked={this.props.addToProject}
              />
            </div>
          ) : (
            <div>
              <Select
                menuItemStyle={{ fontSize: "12px" }}
                labelStyle={{ fontSize: "12px" }}
                onChange={this.changeSplitField.bind(this)}
                value={this.state.splitField}
                floatingLabelText="Split features by"
                floatingLabelFixed={true}
              >
                {this.state.fieldnames.map((item) => {
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
              <Checkbox
                label="Add to project"
                style={{
                  fontSize: "12px",
                  width: "200px",
                  display: "inline-block",
                  marginTop: "10px",
                }}
                onCheck={this.props.setAddToProject}
                checked={this.props.addToProject}
              />
            </div>
          )
        ) : null}
      </div>
    );
    return (
      <MarxanDialog
        {...this.props}
        onOk={this.closeDialog.bind(this)}
        okLabel={"Cancel"}
        contentWidth={390}
        title={"Import features"}
        actions={actions}
        onClose={this.closeDialog.bind(this)}
        helpLink={"user.html#importing-from-a-shapefile"}
      >
        {children}
      </MarxanDialog>
    );
  }
}

export default ImportFeaturesDialog;

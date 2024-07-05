/*
 * Copyright (c) 2021 Carlos Tighe.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import * as React from "react";

import FileUpload from "../FileUpload.js";
import MarxanDialog from "../MarxanDialog";
import MarxanTable from "../MarxanTable";
import MarxanTextField from "../MarxanTextField";
import Sync from "@mui/icons-material/Sync";
import TableRow from "../TableRow.js";
import ToolbarButton from "../ToolbarButton";

let INITIAL_STATE = {
  steps: ["Select Activity", "raster", "metadata"],
  stepIndex: 0,
  filename: "",
  description: "",
  searchText: "",
  selectedActivity: "",
  message: "",
};

const title = [
  "Import Activity",
  "Upload File & Create Pressures",
  "Run Cumulative Impact",
];

class ImportImpactsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  handleNext() {
    const { stepIndex } = this.state;
    switch (stepIndex) {
      case this.state.steps.length - 1:
        this.importImpacts();
        break;
      default:
        this.setState({ stepIndex: stepIndex + 1 });
    }
  }

  handlePrev() {
    const { stepIndex } = this.state;
    this.setState({ stepIndex: stepIndex - 1 });
  }

  setSelectedActivity(activity) {
    console.log("activity ", activity);
    this.setState({ selectedActivity: activity });
  }

  setFilename(newValue) {
    this.setState({ filename: newValue });
  }

  changeFileName(event, newValue) {
    this.setState({ filename: newValue });
  }

  changeDescription(event, newValue) {
    this.setState({ description: newValue });
  }

  searchTextChanged(value) {
    this.setState({ searchText: value });
  }

  setMessage(newValue) {
    this.setState({ message: newValue });
  }

  importImpacts() {
    this.props
      .importImpacts(
        this.state.filename,
        this.state.selectedActivity,
        this.state.description
      )
      .then((response) => {
        console.log("response from impact ", response);
        this.setMessage(response);
        this.closeDialog();
      });
  }

  renderActivity(row) {
    return <TableRow title={row.original.activity} />;
  }
  renderCategory(row) {
    return <TableRow title={row.original.category} />;
  }

  closeDialog() {
    //delete the zip file and shapefile
    this.setState({
      steps: ["Select Activity", "raster", "metadata"],
      stepIndex: 0,
      filename: "",
      description: "",
      searchText: "",
      selectedActivity: "",
      message: "",
    });
    this.props.onCancel();
  }

  render() {
    let _disabled = false;
    const { stepIndex } = this.state;
    const contentStyle = { margin: "0 16px" };
    let tableColumns = [
      {
        Header: "Category",
        accessor: "category",
        width: 269,
        headerStyle: { textAlign: "left" },
        Cell: this.renderCategory.bind(this),
      },
      {
        Header: "Activity",
        accessor: "activity",
        width: 290,
        headerStyle: { textAlign: "left" },
        Cell: this.renderActivity.bind(this),
      },
    ];

    //get the disabled state for the next/finish button
    switch (stepIndex) {
      case 0:
        _disabled = this.state.selectedActivity === "";
        break;
      case 1:
        _disabled = this.state.filename === "";
        break;
      default:
    }
    const actions = [
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <div style={contentStyle}>
          <div style={{ marginTop: 12 }}>
            <ToolbarButton
              label="Back"
              disabled={stepIndex === 0 || this.props.loading}
              onClick={this.handlePrev.bind(this)}
            />
            <ToolbarButton
              label={
                stepIndex === this.state.steps.length - 1
                  ? "Start Cumulative Impact"
                  : "Next"
              }
              onClick={this.handleNext.bind(this)}
              disabled={
                _disabled ||
                this.props.loading ||
                (stepIndex === 2 &&
                  (this.state.filename === "" || this.state.description === ""))
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
          <div id="activityTable">
            <h4>Select an activity then upload your raster file...</h4>
            <MarxanTable
              data={this.props.activities}
              columns={tableColumns}
              searchColumns={["category", "activity"]}
              searchText={this.state.searchText}
              selectedActivity={this.state.selectedActivity}
              getTrProps={(state, rowInfo) => {
                return {
                  style: {
                    background:
                      rowInfo.original.activity === this.state.selectedActivity
                        ? "rgb(0, 188, 212)"
                        : "",
                    color:
                      rowInfo.original.activity === this.state.selectedActivity
                        ? "white"
                        : "",
                  },

                  onClick: (e) => {
                    console.log("e ", e);
                    this.setSelectedActivity(rowInfo.original.activity);
                  },
                };
              }}
              getTdProps={(state, rowInfo, column) => {
                return {
                  onClick: (e) => {
                    console.log("e in TD ", e);
                    this.setSelectedActivity(rowInfo.original.activity);
                  },
                };
              }}
            />
          </div>
        ) : null}
        {stepIndex === 1 ? (
          <div>
            <FileUpload
              {...this.props}
              selectedActivity={this.state.selectedActivity}
              fileMatch={".tif"}
              mandatory={true}
              filename={this.state.filename}
              setFilename={this.setFilename.bind(this)}
              destFolder={"imports"}
              label="Raster"
              style={{ paddingTop: "10px" }}
            />
          </div>
        ) : null}
        {stepIndex === 2 ? (
          <div>
            <div>
              {this.props.runningImpactMessage}
              <Sync
                className="spin"
                style={{
                  display:
                    this.props.loading || this.props.showSpinner
                      ? "inline-block"
                      : "none",
                  color: "rgb(255, 64, 129)",
                  top: "15px",
                  right: "41px",
                  height: "22px",
                  width: "22px",
                }}
                key={"spinner"}
              />
            </div>
            <MarxanTextField
              value={this.state.filename}
              onChange={this.changeFileName.bind(this)}
              floatingLabelText="Enter a name"
            />
            <MarxanTextField
              value={this.state.description}
              onChange={this.changeDescription.bind(this)}
              multiLine={true}
              rows={2}
              floatingLabelText="Enter a description"
            />
          </div>
        ) : null}
      </div>
    );
    return (
      <MarxanDialog
        {...this.props}
        onOk={this.closeDialog.bind(this)}
        okLabel={"Cancel"}
        bodyStyle={{ padding: "0px 24px 0px 24px" }}
        title={title[this.state.stepIndex]}
        showSearchBox={true}
        searchTextChanged={this.searchTextChanged.bind(this)}
        actions={actions}
        onClose={this.closeDialog.bind(this)}
        helpLink={"user.html#importing-from-a-shapefile"}
      >
        {children}
      </MarxanDialog>
    );
  }
}

export default ImportImpactsDialog;

import MarxanDialog from "./MarxanDialog";
import MarxanTable from "./MarxanTable";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";

class AtlasLayersDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      planning_grid_name: "",
      zipFilename: "",
      description: "",
      snackbarOpen: false,
      snackbarMessage: "",
    };
  }

  closeDialog() {
    this.props.onOk();
  }

  onCancel() {}

  onOk() {
    let _description =
      this.state.description === ""
        ? "Imported using the cumulative impact dialog"
        : this.state.description;
    this.props
      .onOk(this.state.zipFilename, this.state.planning_grid_name, _description)
      .then(function (response) {
        //reset the state
        this.setState({
          planning_grid_name: "",
          zipFilename: "",
          description: "",
        });
      })
      .catch(function (ex) {
        //error uploading the shapefile
      });
  }

  renderRow(title) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
        title={title}
      >
        {title}
      </div>
    );
  }
  renderlayer(row) {
    return this.renderRow(row.original.layer);
  }
  renderTitle(row) {
    return this.renderRow(row.original.title);
  }
  searchTextChanged(value) {
    this.setState({ searchText: value });
  }
  render() {
    let tableColumns = [
      {
        Header: "Layer Title",
        accessor: "title",
        width: "100%",
        headerStyle: { textAlign: "left" },
        Cell: this.renderTitle.bind(this),
      },
    ];
    return (
      <MarxanDialog
        {...this.props}
        // titleBarIcon={faBookOpen}
        onOk={this.closeDialog.bind(this)}
        onCancel={this.props.onCancel}
        onRequestClose={this.props.onCancel.bind(this)}
        helpLink={"user.html#the-planning-grids-window"}
        bodyStyle={{ padding: "0px 24px 0px 24px" }}
        title="Atlas Layers Selection"
        searchTextChanged={this.searchTextChanged.bind(this)}
        showCancelButton="true"
        cancelLabel="Clear all Layers"
        showSearchBox="true"
        autoDetectWindowHeight={false}
        children={
          <React.Fragment key="k2">
            <div id="atlasLayertable">
              <h4>Select a layer to view on map</h4>
              <MarxanTable
                data={this.props.atlasLayers}
                columns={tableColumns}
                searchColumns={["title"]}
                searchText={this.state.searchText}
                selectedLayers={this.props.selectedLayers}
                getTrProps={(state, rowInfo) => {
                  return {
                    style: {
                      background: this.props.selectedLayers.includes(
                        rowInfo.original.layer
                      )
                        ? "rgb(0, 188, 212)"
                        : "",
                      color: this.props.selectedLayers.includes(
                        rowInfo.original.layer
                      )
                        ? "white"
                        : "",
                    },
                    onClick: (e) => {
                      this.props.setselectedLayers(rowInfo.original.layer);
                    },
                  };
                }}
              />
            </div>
            <div
              id="projectsToolbar"
              style={{
                display: this.props.userRole === "ReadOnly" ? "none" : "block",
              }}
            ></div>
          </React.Fragment>
        }
      />
    ); //return
  }
}

export default AtlasLayersDialog;

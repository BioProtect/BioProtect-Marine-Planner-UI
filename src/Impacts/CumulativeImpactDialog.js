/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import "react-table/react-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import Import from "material-ui/svg-icons/action/get-app";
import ToolbarButton from "../ToolbarButton";
import MarxanDialog from "../MarxanDialog";
import MarxanTable from "../MarxanTable";
import TableRow from "../TableRow.js";

import Popover from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";

class CumulativeImpactDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      selectedActivity: undefined,
      description: "",
      snackbarOpen: false,
      snackbarMessage: "",
      selectedImpact: "",
      selectedImpactIds: [],
    };
  }
  _delete() {
    this.props.deleteImpact(this.state.selectedImpact);
    this.setState({ selectedImpact: undefined });
  }
  showNewImpactPopover(event) {
    this.setState({ newImpactAnchor: event.currentTarget });
    this.props.showNewImpactPopover();
  }
  showImportImpactPopover(event) {
    this.setState({ importImpactAnchor: event.currentTarget });
    this.props.showImportImpactPopover();
  }
  _openImportImpactsDialog() {
    //close the dialog
    this.props.onCancel();
    //show the new feature dialog
    this.props.openImportImpactsDialog("import");
  }
  _newByDigitising() {
    //hide this dialog
    this.onOk();
    //show the drawing controls
    this.props.initialiseDigitising();
  }
  clickImpact(event, rowInfo) {
    console.log("rowInfo ", rowInfo);
    //if adding or removing features from a project
    this.props.clickImpact(
      rowInfo.original,
      event.shiftKey,
      this.state.previousRow
    );
    this.setState({ selectedImpact: rowInfo.original });
  }
  //gets the features ids between the two passed rows and toggles their selection state
  getImpactsBetweenRows(previousRow, thisRow) {
    let selectedIds;
    //get the index position of the previous row that was clicked
    let idx1 =
      previousRow.index < thisRow.index ? previousRow.index + 1 : thisRow.index;
    //get the index position of this row that was clicked
    let idx2 =
      previousRow.index < thisRow.index ? thisRow.index + 1 : previousRow.index;
    //toggle the selected features depending on if the current features are filtered
    if (this.filteredRows.length < this.props.allImpacts.length) {
      selectedIds = this.toggleSelectionState(
        this.props.selectedImpactIds,
        this.filteredRows,
        idx1,
        idx2
      );
    } else {
      selectedIds = this.toggleSelectionState(
        this.props.selectedImpactIds,
        this.props.allImpacts,
        idx1,
        idx2
      );
    }
    return selectedIds;
  }

  //toggles the selection state of the features between the first and last indices and returns an array of the selected featureIds
  toggleSelectionState(selectedIds, features, first, last) {
    //get the features between the first and last positions
    let spannedImpacts = features.slice(first, last);
    //iterate through them and toggle their selected state
    spannedImpacts.forEach((feature) => {
      if (selectedIds.includes(feature.id)) {
        selectedIds.splice(selectedIds.indexOf(feature.id), 1);
      } else {
        selectedIds.push(feature.id);
      }
    });
    return selectedIds;
  }

  closeDialog() {
    this.setState({ selectedActivity: undefined });
    this.props.onOk();
  }

  onOk(evt) {
    this.props.onOk();
  }

  preview(impact_metadata) {
    this.props.previewImpact(impact_metadata);
  }

  renderTitle(row) {
    return <TableRow title={row.original.description} />;
  }
  renderActivity(row) {
    return <TableRow title={row.original.acttivity} />;
  }
  renderSource(row) {
    return <TableRow title={row.original.source} />;
  }
  renderCategory(row) {
    return <TableRow title={row.original.category} />;
  }
  renderCreatedBy(row) {
    return <TableRow title={row.original.created_by} />;
  }
  renderDate(row) {
    return (
      <TableRow
        title={row.original.creation_date}
        htmlContent={row.original.creation_date.substr(0, 8)}
      />
    );
  }
  searchTextChanged(value) {
    this.setState({ searchText: value });
  }
  //called when the data in the marxantable is filtered
  dataFiltered(filteredRows) {
    //set the local filteredRows variable which is used to get filtered features between clicked rows
    this.filteredRows = filteredRows;
  }
  render() {
    let tableColumns = [
      {
        Header: "Name",
        accessor: "alias",
        width: 193,
        headerStyle: { textAlign: "left" },
      },
      {
        Header: "Description",
        accessor: "description",
        width: 246,
        headerStyle: { textAlign: "left" },
        Cell: this.renderTitle.bind(this),
      },
      {
        Header: "Source",
        accessor: "source",
        width: 120,
        headerStyle: { textAlign: "left" },
        Cell: this.renderSource.bind(this),
      },
      {
        Header: "Created by",
        accessor: "created_by",
        width: 70,
        headerStyle: { textAlign: "left" },
        Cell: this.renderCreatedBy.bind(this),
      },
      {
        Header: "Creation Date",
        accessor: "created_date",
        width: 70,
        headerStyle: { textAlign: "left" },
        Cell: this.renderDate.bind(this),
      },
    ];
    return (
      <MarxanDialog
        {...this.props}
        autoDetectWindowHeight={false}
        bodyStyle={{ padding: "0px 24px 0px 24px" }}
        title="Impacts"
        onOk={this.onOk.bind(this)}
        showSearchBox={true}
        searchTextChanged={this.searchTextChanged.bind(this)}
        children={
          <React.Fragment key="k10">
            <div id="projectsTable">
              <MarxanTable
                data={this.props.allImpacts}
                searchColumns={["alias", "description", "source", "created_by"]}
                searchText={this.state.searchText}
                dataFiltered={this.dataFiltered.bind(this)}
                selectedImpactIds={this.props.selectedImpactIds}
                clickImpact={this.clickImpact.bind(this)}
                preview={this.preview.bind(this)}
                columns={tableColumns}
                getTrProps={(state, rowInfo, column) => {
                  console.log("rowInfo ", rowInfo);
                  console.log(
                    "tate.selectedImpactIds.includes(rowInfo.original.id) ",
                    state.selectedImpactIds.includes(rowInfo.original.id)
                  );
                  console.log(
                    "state.selectedImpactIds ",
                    state.selectedImpactIds
                  );
                  console.log("state.selectedImpact ", state.selectedImpact);

                  return {
                    style: {
                      background:
                        state.selectedImpactIds.includes(rowInfo.original.id) ||
                        (state.selectedImpact &&
                          state.selectedImpact.id === rowInfo.original.id)
                          ? "aliceblue"
                          : "",
                    },
                    onClick: (e) => {
                      state.clickImpact(e, rowInfo);
                    },
                  };
                }}
                getTdProps={(state, rowInfo, column) => {
                  return {
                    onClick: (e) => {
                      if (column.Header === "") state.preview(rowInfo.original);
                    },
                  };
                }}
              />
            </div>
            <div id="projectsToolbar">
              <div
                style={{
                  display: this.props.metadata.OLDVERSION ? "block" : "none",
                }}
                className={"tabTitle"}
              >
                This is an imported project. Only features from this project are
                shown.
              </div>
              <ToolbarButton
                show={
                  this.props.userRole !== "ReadOnly" &&
                  !this.props.metadata.OLDVERSION
                    ? "true"
                    : "false"
                }
                icon={<FontAwesomeIcon icon={faPlusCircle} />}
                title="New feature"
                disabled={this.props.loading}
                onClick={this.showNewImpactPopover.bind(this)}
                label={"New"}
              />
              <Popover
                open={this.props.newImpactPopoverOpen}
                anchorEl={this.state.newImpactAnchor}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                targetOrigin={{ horizontal: "left", vertical: "top" }}
                onRequestClose={this.props.hideNewImpactPopover}
              >
                <Menu desktop={true}>
                  <MenuItem
                    primaryText="Draw on screen"
                    title="Create a new feature by digitising it on the screen"
                    onClick={this._newByDigitising.bind(this)}
                  />
                </Menu>
              </Popover>
              <ToolbarButton
                show={
                  !this.props.metadata.OLDVERSION &&
                  this.props.userRole !== "ReadOnly"
                    ? "true"
                    : "false"
                }
                icon={<Import style={{ height: "20px", width: "20px" }} />}
                title="Create a new cumulative impact layer"
                disabled={this.props.loading}
                onClick={this.showImportImpactPopover.bind(this)}
                label={"Import"}
              />
              <Popover
                open={this.props.importImpactPopoverOpen}
                anchorEl={this.state.importImpactAnchor}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                targetOrigin={{ horizontal: "left", vertical: "top" }}
                onRequestClose={this.props.hideImportImpactPopover}
              >
                <Menu desktop={true}>
                  <MenuItem
                    primaryText="From a raster"
                    title="Load an activity raster"
                    onClick={this._openImportImpactsDialog.bind(this)}
                  />
                </Menu>
              </Popover>
              <ToolbarButton
                show="true"
                icon={
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    color="rgb(255, 64, 129)"
                  />
                }
                title="Delete feature"
                disabled={
                  this.state.selectedImpact === undefined ||
                  this.props.loading ||
                  (this.state.selectedImpact &&
                    this.state.selectedImpact.created_by === "global admin")
                }
                onClick={this._delete.bind(this)}
                label={"Delete"}
              />
              <ToolbarButton
                show={"true"}
                icon={<FontAwesomeIcon icon={faCircle} />}
                title="Clear all Impact layers"
                onClick={this.props.clearAllImpacts}
                label={"Clear all"}
              />
            </div>
          </React.Fragment>
        }
      />
    );
  }
}

export default CumulativeImpactDialog;

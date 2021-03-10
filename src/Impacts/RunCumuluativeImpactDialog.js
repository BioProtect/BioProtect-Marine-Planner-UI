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

class ImportedActivitiesDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      description: "",
      snackbarOpen: false,
      snackbarMessage: "",
      selectedUploadedActivityIds: [],
    };
  }
  showNewActivityPopover(event) {
    this.setState({ newActivityAnchor: event.currentTarget });
    this.props.showNewActivityPopover();
  }
  showImportActivityPopover(event) {
    this.setState({ importActivityAnchor: event.currentTarget });
    this.props.showImportActivityPopover();
  }
  _openImportActivityDialog() {
    //close the dialog
    this.props.onCancel();
    //show the new feature dialog
    this.props.openImportActivityDialog();
  }
  _newByDigitising() {
    //hide this dialog
    this.onOk();
    //show the drawing controls
    this.props.initialiseDigitising();
  }

  runCumulativeImpact() {
    console.log(
      "this.state.selectedUploadedActivityIds ",
      this.state.selectedUploadedActivityIds
    );

    this.props.runCumulativeImpact(this.state.selectedUploadedActivityIds);
  }

  //when a user clicks a impact in the ImpactsDialog
  clickActivity(event, rowInfo) {
    if (this.state.selectedUploadedActivityIds.includes(rowInfo.original.id)) {
      // remove the rowInfo.original
      this.setState((prevState) => ({
        selectedUploadedActivityIds: prevState.selectedUploadedActivityIds.filter(
          (act) => act !== rowInfo.original.id
        ),
      }));
    } else {
      // add the rowInfo.original id
      this.setState((prevState) => ({
        selectedUploadedActivityIds: [
          ...prevState.selectedUploadedActivityIds,
          rowInfo.original.id,
        ],
      }));
    }
  }

  //toggles the selection state of the features between the first and last indices and returns an array of the selected featureIds
  toggleSelectionState(selectedIds, features, first, last) {
    //get the features between the first and last positions
    let spannedActivitys = features.slice(first, last);
    //iterate through them and toggle their selected state
    spannedActivitys.forEach((feature) => {
      if (selectedIds.includes(feature.id)) {
        selectedIds.splice(selectedIds.indexOf(feature.id), 1);
      } else {
        selectedIds.push(feature.id);
      }
    });
    return selectedIds;
  }

  closeDialog() {
    this.props.onOk();
  }

  onOk(evt) {
    this.props.onOk();
  }

  renderActivity(row) {
    return <TableRow title={row.original.activity} />;
  }
  renderSource(row) {
    return <TableRow title={row.original.source} />;
  }
  renderFilename(row) {
    return <TableRow title={row.original.filename} />;
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
  title(title, subtitle) {
    return (
      <div>
        <div>{title}</div>
        <h6>{subtitle}</h6>
      </div>
    );
  }
  searchTextChanged(value) {
    this.setState({ searchText: value.toLowerCase() });
  }
  //called when the data in the marxantable is filtered
  dataFiltered(filteredRows) {
    //set the local filteredRows variable which is used to get filtered features between clicked rows
    this.filteredRows = filteredRows;
  }
  render() {
    let tableColumns = [
      {
        Header: "Activity",
        accessor: "activity",
        width: 193,
        headerStyle: { textAlign: "left" },
        Cell: this.renderActivity.bind(this),
      },
      {
        Header: "Filename",
        accessor: "filename",
        width: 200,
        headerStyle: { textAlign: "left" },
        Cell: this.renderFilename.bind(this),
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
        title={this.title(
          "Uploaded Activities",
          "Select an uploaded activity and then run"
        )}
        onOk={this.onOk.bind(this)}
        showSearchBox={true}
        searchTextChanged={this.searchTextChanged.bind(this)}
        children={
          <React.Fragment key="k10">
            <div id="projectsTable">
              <MarxanTable
                data={this.props.uploadedActivities}
                searchColumns={["alias", "description", "source", "created_by"]}
                searchText={this.state.searchText}
                dataFiltered={this.dataFiltered.bind(this)}
                selectedUploadedActivityIds={
                  this.state.selectedUploadedActivityIds
                }
                clickActivity={this.clickActivity.bind(this)}
                columns={tableColumns}
                getTrProps={(state, rowInfo, column) => {
                  return {
                    style: {
                      background: state.selectedUploadedActivityIds.includes(
                        rowInfo.original.id
                      )
                        ? "aliceblue"
                        : "",
                    },
                    onClick: (e) => {
                      state.clickActivity(e, rowInfo);
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
                title="Run Cumulative Impact Function"
                primary={true}
                disabled={
                  this.props.loading ||
                  this.state.selectedUploadedActivityIds.length < 1
                }
                onClick={this.runCumulativeImpact.bind(this)}
                label={"Run Cumulative Impact Function"}
              />
            </div>
          </React.Fragment>
        }
      />
    );
  }
}

export default ImportedActivitiesDialog;

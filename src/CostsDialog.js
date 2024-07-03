import CONSTANTS from "./constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import MarxanDialog from "./MarxanDialog";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import ReactTable from "react-table";
import TableRow from "./TableRow";
import ToolbarButton from "./ToolbarButton";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

class CostsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedCost: undefined };
  }
  changeCost(event, cost) {
    this.setState({ selectedCost: cost });
  }
  costFromImpact(e, data) {
    console.log("data ", data);
    this.props.createCostsFromImpact(data);
  }
  _delete() {
    this.props.deleteCost(this.state.selectedCost.name);
    this.setState({ selectedCost: undefined });
  }

  renderDate(row) {
    return (
      <TableRow
        title={row.original.creation_date}
        htmlContent={row.original.creation_date.substr(0, 8)}
      />
    );
  }
  render() {
    let _data = this.props.data.map((item) => {
      return { name: item };
    });
    return (
      <MarxanDialog
        {...this.props}
        contentWidth={390}
        autoDetectWindowHeight={false}
        bodyStyle={{ padding: "0px 24px 0px 24px" }}
        offsetY={80}
        title="Costs"
        onRequestClose={() =>
          this.props.updateState({ costsDialogOpen: false })
        }
        helpLink={"user.html#importing-a-cost-surface"}
        children={
          <React.Fragment key="k8">
            <ReactTable
              {...this.props}
              pageSize={_data.length}
              columns={[
                {
                  Header: "Name",
                  accessor: "name",
                  headerStyle: { textAlign: "left" },
                },
              ]}
              className={"projectsReactTable noselect"}
              showPagination={false}
              minRows={0}
              data={_data}
              selectedCost={this.state.selectedCost}
              changeCost={this.changeCost.bind(this)}
              getTrProps={(state, rowInfo) => {
                return {
                  style: {
                    background:
                      rowInfo.original.name ===
                      (state.selectedCost && state.selectedCost.name)
                        ? "aliceblue"
                        : "",
                  },
                  onClick: (e) => {
                    state.changeCost(e, rowInfo.original);
                  },
                };
              }}
            />
            <div id="costsToolbar">
              <ToolbarButton
                show={this.props.userRole !== "ReadOnly"}
                icon={<Import style={{ height: "20px", width: "20px" }} />}
                title="Upload a new costs file"
                disabled={this.props.loading}
                onClick={() =>
                  this.props.updateState({ importCostsDialogOpen: true })
                }
                label={"Import"}
              />
              <ToolbarButton
                show={
                  !this.props.unauthorisedMethods.includes(
                    "deletePlanningUnitGrid"
                  )
                }
                icon={
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    color="rgb(255, 64, 129)"
                  />
                }
                title="Delete cost profile"
                disabled={
                  !this.state.selectedCost ||
                  (this.state.selectedCost &&
                    this.state.selectedCost.name === this.props.costname) ||
                  (this.state.selectedCost &&
                    this.state.selectedCost.name ===
                      CONSTANTS.UNIFORM_COST_NAME)
                }
                onClick={this._delete.bind(this)}
                label={"Delete"}
              />
            </div>
            <div id="projectsTable">
              <h3 className="dialogTitleStyle">Use Cumulative Impact</h3>
              <ReactTable
                {...this.props}
                data={this.props.allImpacts}
                columns={[
                  {
                    Header: "Name",
                    accessor: "alias",
                    width: 193,
                    headerStyle: { textAlign: "left" },
                  },
                  {
                    Header: "Creation Date",
                    accessor: "created_date",
                    width: 70,
                    headerStyle: { textAlign: "left" },
                    Cell: this.renderDate.bind(this),
                  },
                ]}
                className={"projectsReactTable noselect"}
                showPagination={false}
                minRows={0}
                // selectedCost={this.state.selectedCost}
                // changeCost={this.changeCost.bind(this)}
                getTrProps={(state, rowInfo) => {
                  return {
                    style: {
                      background:
                        rowInfo.original.name ===
                        (state.selectedCost && state.selectedCost.name)
                          ? "aliceblue"
                          : "",
                    },
                    onClick: (e) => {
                      this.costFromImpact(e, rowInfo.original);
                    },
                  };
                }}
              />
            </div>
          </React.Fragment>
        }
      />
    );
  }
}

export default CostsDialog;

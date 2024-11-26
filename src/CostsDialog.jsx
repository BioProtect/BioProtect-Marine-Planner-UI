import React, { useEffect, useState } from "react";

import CONSTANTS from "./constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import MarxanDialog from "./MarxanDialog";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ToolbarButton from "./ToolbarButton";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const CostsDialog = (props) => {
  const [selectedCost, setSelectedCost] = useState(undefined);

  useEffect(() => {
    if (props.open) {
      // Additional logic when dialog opens can go here
    }
  }, [props.open]);

  const changeCost = (event, cost) => {
    setSelectedCost(cost);
  };

  const costFromImpact = (e, data) => {
    props.createCostsFromImpact(data);
  };

  const deleteCost = () => {
    props.deleteCost(selectedCost.name);
    setSelectedCost(undefined);
  };

  const renderDate = (row) => {
    return (
      <TableRow title={row.original.creation_date}>
        <TableCell>{row.original.creation_date.slice(0, 8)}</TableCell>
      </TableRow>
    );
  };

  const _data = props.data.map((item) => ({ name: item }));

  return (
    <MarxanDialog
      open={props.open}
      onOk={props.onOk}
      onCancel={props.onCancel}
      title="Costs"
      onClose={props.onClose}
      helpLink={"user.html#importing-a-cost-surface"}
    >
      <div>
        <Table
          {...props}
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
          selectedCost={selectedCost}
          changeCost={changeCost}
          getTrProps={(state, rowInfo) => ({
            style: {
              background:
                rowInfo.original.name === (selectedCost && selectedCost.name)
                  ? "aliceblue"
                  : "",
            },
            onClick: (e) => {
              changeCost(e, rowInfo.original);
            },
          })}
        />
        <div id="costsToolbar">
          <ToolbarButton
            show={props.userRole !== "ReadOnly"}
            icon={<Import style={{ height: "20px", width: "20px" }} />}
            title="Upload a new costs file"
            disabled={props.loading}
            onClick={() => props.setImportCostsDialogOpen(true)}
            label={"Import"}
          />
          <ToolbarButton
            show={!props.unauthorisedMethods.includes("deletePlanningUnitGrid")}
            icon={
              <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
            }
            title="Delete cost profile"
            disabled={
              !selectedCost ||
              (selectedCost && selectedCost.name === props.costname) ||
              (selectedCost &&
                selectedCost.name === CONSTANTS.UNIFORM_COST_NAME)
            }
            onClick={deleteCost}
            label={"Delete"}
          />
        </div>
        <div id="projectsTable">
          <h3 className="dialogTitleStyle">Use Cumulative Impact</h3>
          <Table
            {...props}
            data={props.allImpacts}
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
                Cell: renderDate,
              },
            ]}
            className={"projectsReactTable noselect"}
            showPagination={false}
            minRows={0}
            getTrProps={(state, rowInfo) => ({
              style: {
                background:
                  rowInfo.original.name ===
                  (state.selectedCost && state.selectedCost.name)
                    ? "aliceblue"
                    : "",
              },
              onClick: (e) => {
                costFromImpact(e, rowInfo.original);
              },
            })}
          />
        </div>
      </div>
    </MarxanDialog>
  );
};

export default CostsDialog;

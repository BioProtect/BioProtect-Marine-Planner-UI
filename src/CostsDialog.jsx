import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "./BPComponents/BioprotectTable";
import CONSTANTS from "./constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import MarxanDialog from "./MarxanDialog";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import ToolbarButton from "./ToolbarButton";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { toggleDialog } from "@slices/uiSlice";

const CostsDialog = (props) => {
  const {
    unauthorisedMethods,
    costname,
    deleteCost,
    data,
    createCostsFromImpact,
  } = props
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);

  const [selectedCost, setSelectedCost] = useState(undefined);

  const changeCost = (event, cost) => setSelectedCost(cost);

  const costFromImpact = (e, data) => createCostsFromImpact(data);

  const handleDeleteCost = () => {
    deleteCost(selectedCost.name);
    setSelectedCost(undefined);
  };

  const closeDialog = () =>
    dispatch(toggleDialog({ dialogName: "costsDialogOpen", isOpen: false }));

  const renderDate = (row) => {
    return (
      <TableRow title={row.original.creation_date}>
        <TableCell>{row.original.creation_date.slice(0, 8)}</TableCell>
      </TableRow>
    );
  };

  const _data = data.map((item) => ({ name: item }));

  return (
    <MarxanDialog
      open={dialogStates.costsDialogOpen}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      onClose={() => closeDialog()}
      title="Costs"
    >
      <div>
        <BioprotectTable
          data={_data}
          selected={selectedCost}
          columns={[{ id: "name", label: "Name" }]}
          changeCost={changeCost}
          clickRow={() => changeCost(e, rowInfo.original)}
        ></BioprotectTable>
        {/* <Table
          {...props}
          pageSize={_data.length}
          columns={[
            {
              label: "Name",
              id: "name",
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
        /> */}
        <div id="costsToolbar">
          <ToolbarButton
            icon={<Import style={{ height: "20px", width: "20px" }} />}
            title="Upload a new costs file"
            disabled={uiState.loading}
            onClick={() =>
              dispatch(
                toggleDialog({
                  dialogName: "importCostsDialogOpen",
                  isOpen: true,
                })
              )
            }
            label={"Import"}
          />
          <ToolbarButton
            show={!unauthorisedMethods.includes("deletePlanningUnitGrid")}
            icon={
              <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
            }
            title="Delete cost profile"
            disabled={
              !selectedCost ||
              (selectedCost && selectedCost.name === costname) ||
              (selectedCost &&
                selectedCost.name === CONSTANTS.UNIFORM_COST_NAME)
            }
            onClick={handleDeleteCost}
            label={"Delete"}
          />
        </div>
        <div id="projectsTable">
          <h3 className="dialogTitleStyle">Use Cumulative Impact</h3>
          <Table
            {...props}
            data={uiState.allImpacts}
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

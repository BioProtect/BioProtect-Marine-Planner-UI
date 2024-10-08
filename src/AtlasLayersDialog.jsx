import React, { useState } from "react";

import BioprotectTable from "./BPComponents/BioprotectTable";
import MarxanDialog from "./MarxanDialog";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const AtlasLayersDialog = (props) => {
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const handleClick = (layer, index) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(index)) {
        // If the row is already selected, remove it
        return prevSelectedRows.filter((row) => row !== index);
      } else {
        // Otherwise, add it to the selected rows
        return [...prevSelectedRows, index];
      }
    });
    props.setselectedLayers(layer);
  };

  const clearLayers = () => {
    setSelectedRows([]);
    props.onCancel();
  };

  const tableColumns = [
    {
      id: "title",
      label: "title",
      numeric: false,
      disablePadding: true,
    },
  ];
  if (props.atlasLayers.length > 0) {
    return (
      <MarxanDialog
        open={props.open}
        onOk={props.onOk}
        onCancel={() => clearLayers()}
        loading={props.loading}
        helpLink={"user.html#the-planning-grids-window"}
        title="Atlas Layers Selection"
        setSearchText={setSearchText}
        showSearchBox={true}
        showCancelButton={true}
        cancelLabel="Clear all Layers"
      >
        <BioprotectTable
          title="Atlas Layers"
          data={props.atlasLayers}
          tableColumns={tableColumns}
          initialSelection={null}
          ableToSelectAll={true}
          showSearchBox={true}
          searchColumns={["title"]}
        />
        <Table
          stickyHeader
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => (
                <TableCell key={column.id} align="left" width={column.width}>
                  {column.id}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.atlasLayers.length > 0 ? (
              props.atlasLayers.map((layer, idx) => (
                <TableRow
                  onClick={() => handleClick(layer.layer, idx)}
                  key={layer.title + idx}
                  sx={{
                    backgroundColor: selectedRows.includes(idx)
                      ? "#f0f0f0"
                      : "white",
                    "&:hover": {
                      backgroundColor: "#e0e0e0", // Add hover effect
                    },
                    cursor: "pointer", // Change cursor to pointer when hovering
                  }}
                >
                  <TableCell scope="row">{layer.title}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell scope="row">Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default AtlasLayersDialog;

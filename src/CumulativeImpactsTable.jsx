import React, { useMemo, useState } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const CumulativeImpactsTable = (props) => {
  const columns = props.columns;

  const filterData = () => {
    if (!props.searchText) {
      return props.data;
    }

    return props.data.filter((item) => {
      const searchTextLower = props.searchText.toLowerCase();

      if (searchTextLower.startsWith("!")) {
        return !Object.keys(item).some(
          (key) =>
            props.searchColumns.includes(key) &&
            item[key] &&
            item[key].toLowerCase().includes(searchTextLower.substring(1))
        );
      } else {
        return Object.keys(item).some(
          (key) =>
            props.searchColumns.includes(key) &&
            item[key] &&
            item[key].toLowerCase().includes(searchTextLower)
        );
      }
    });
  };

  const filteredData = useMemo(
    () => filterData(),
    [props.data, props.searchText, props.searchColumns]
  );

  if (props.dataFiltered) {
    props.dataFiltered(filteredData);
  }

  return (
    <Table
      stickyHeader
      sx={{ minWidth: 650 }}
      size="small"
      aria-label="a dense table"
    >
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} align="left" width={column.width}>
              {column.id.toUpperCase()}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredData.map((row) => (
          <TableRow
            key={row.name}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell scope="row">{row.name}</TableCell>
            <TableCell align="left">{row.original.description}</TableCell>
            <TableCell align="left">{row.original.source}</TableCell>
            <TableCell align="left">{row.original.created_by}</TableCell>
            <TableCell align="left">
              {row.original.creation_date.substr(0, 8)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CumulativeImpactsTable;

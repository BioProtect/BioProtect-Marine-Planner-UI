/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */

import React, { useMemo, useState } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const ProjectsTable = (props) => {
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
              {column.id}
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
            <TableCell align="left">{row.description}</TableCell>
            <TableCell align="left">{row.createdate}</TableCell>
            <TableCell align="left">{row.user}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable;

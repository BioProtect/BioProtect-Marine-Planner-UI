import React, { useCallback, useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";

const BPTableHeadWithSort = (props) => {
  const createSortHandler = (property) => (event) => {
    props.onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          {props.ableToSelectAll ? (
            <Checkbox
              color="primary"
              indeterminate={
                props.numSelected > 0 && props.numSelected < props.rowCount
              }
              checked={
                props.rowCount > 0 && props.numSelected === props.rowCount
              }
              onChange={props.onSelectAllClick}
              inputProps={{
                "aria-label": "select all",
              }}
            />
          ) : null}
        </TableCell>
        {props.tableColumns.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={props.orderBy === headCell.id ? props.order : false}
          >
            <TableSortLabel
              active={props.orderBy === headCell.id}
              direction={props.orderBy === headCell.id ? props.order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label.toUpperCase()}
              {props.orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {props.order === "desc"
                    ? "sorted descending"
                    : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default BPTableHeadWithSort;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { descendingComparator, getComparator, stableSort } from "../Helpers";

import BPTableHeadWithSort from "./BPTableHeadWithSort";
import BPTableTitleWithSearch from "./BPTableTitleWithSearch";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

const BioprotectTable = (props) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("category");
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const setInitialSelection = useCallback(() => {
    if (props.initialSelection) {
      const selectedIndex = props.data.findIndex(
        (obj) => obj.name === props.initialSelection
      );
      if (selectedIndex !== -1) {
        setSelected([selectedIndex]); // Assuming selected is an array of indices
      }
    }
  }, [props.initialSelection, props.data]);

  useEffect(() => {
    setInitialSelection();
  }, [setInitialSelection]);

  const filteredData = useMemo(() => {
    if (!searchQuery)
      return stableSort(props.data, getComparator(order, orderBy));

    const lowerCaseQuery = searchQuery.toLowerCase();

    const filteredResult = props.data.filter((row) =>
      props.searchColumns.some((column) =>
        row[column].toString().toLowerCase().includes(lowerCaseQuery)
      )
    );
    return stableSort(filteredResult, getComparator(order, orderBy));
  }, [searchQuery, props.data, order, orderBy]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = props.data.map((n, idx) => idx);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    // handle single select or multiple select depending on the table needs
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (props.ableToSelectAll) {
      newSelected = [newSelected, ...selected];
      selectedIndex === -1
        ? newSelected.push(id)
        : newSelected.splice(selectedIndex, 1);
    } else {
      selectedIndex === -1
        ? newSelected.push(id)
        : newSelected.splice(selectedIndex, 1);
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const visibleRows = useMemo(
    () => stableSort(filteredData, getComparator(order, orderBy)),
    [props.data, order, orderBy]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <BPTableTitleWithSearch
        numSelected={selected.length}
        title={props.title}
        setSearchQuery={setSearchQuery}
        showSearchBox={props.showSearchBox}
      />
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size={"small"}
        >
          <BPTableHeadWithSort
            title={props.title}
            tableColumns={props.tableColumns}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={props.data.length}
          />
          <TableBody>
            {filteredData.map((row, idx) => {
              const isItemSelected = isSelected(idx);
              const labelId = `enhanced-table-checkbox-${idx}`;

              return (
                <TableRow
                  hover
                  onClick={(event) => handleClick(event, idx)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id}
                  selected={isItemSelected}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      inputProps={{
                        "aria-labelledby": labelId,
                      }}
                    />
                  </TableCell>
                  {props.tableColumns.map((column) => (
                    <TableCell key={column.id} align="left">
                      {row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BioprotectTable;

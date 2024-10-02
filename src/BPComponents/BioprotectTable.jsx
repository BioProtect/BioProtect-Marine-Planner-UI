import React, { useCallback, useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { SelectAll } from "@mui/icons-material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
  const createSortHandler = (property) => (event) => {
    props.onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={props.searchQuery}
          onChange={(e) => props.setSearchQuery(e.target.value)}
        />
      </TableRow>
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
}

function EnhancedTableToolbar(props) {
  const { numSelected } = props;

  return (
    <Toolbar>
      {numSelected > 0 ? (
        <Typography variant="subtitle1" component="div">
          {props.title} ({numSelected} selected)
        </Typography>
      ) : (
        <Typography variant="subtitle1" id="tableTitle" component="div">
          {props.title}
        </Typography>
      )}
    </Toolbar>
  );
}

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
      console.log("props.initialSelection ", props.initialSelection);
      const selectedIndex = props.data.findIndex(
        (obj) => obj.name === props.initialSelection
      );
      console.log("selectedIndex ", selectedIndex);

      if (selectedIndex !== -1) {
        setSelected([selectedIndex]); // Assuming selected is an array of indices
      }
    }
  }, [props.initialSelection, props.data]);

  useEffect(() => {
    setInitialSelection();
  }, [setInitialSelection]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return props.data;

    const lowerCaseQuery = searchQuery.toLowerCase();

    return props.data.filter((row) =>
      searchColumns.some((column) =>
        row[column].toString().toLowerCase().includes(lowerCaseQuery)
      )
    );
  }, [searchQuery, props.data]);

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
    () => stableSort(props.data, getComparator(order, orderBy)),
    [props.data, order, orderBy]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <EnhancedTableToolbar
        numSelected={selected.length}
        title={props.title}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size={"small"}
        >
          <EnhancedTableHead
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
            {visibleRows.map((row, idx) => {
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

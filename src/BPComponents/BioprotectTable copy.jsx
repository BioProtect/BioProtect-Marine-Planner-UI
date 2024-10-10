import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  checkObjInArray,
  descendingComparator,
  getComparator,
  indexOfObjInArray,
  stableSort,
} from "../Helpers";

import BPTableHeadWithSort from "./BPTableHeadWithSort";
import BPTableTitleWithSearch from "./BPTableTitleWithSearch";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

// Props
// 1. data (Array, Required)
// Description: An array of objects containing the data to be displayed in the table. Each object should have keys that correspond to the columns defined in tableColumns.
// 2. tableColumns (Array, Required)
// Description: Defines the structure and headers of the table. Each item in this array should be an object with id and label properties. The id should match a key from the data array.
// 3. title (String, Required)
// Description: A title that will be displayed above the table.
// 4. showSearchBox (Boolean, Optional)
// Description: A flag to control whether the search box is displayed above the table. Default is false.
// 5. searchColumns (Array of Strings, Required if Search is enabled)
// Description: Defines the columns that will be searched when a search query is entered. The strings should match the keys in data.
// 6. initialSelection (String, Optional)
// Description: The initial selection that pre-selects a row based on the value of a specific column (e.g., the name column).
// 7. ableToSelectAll (Boolean, Optional)
// Description: If true, the table will support selecting all rows at once. Default is false.

const BioprotectTable = (props) => {
  // Props
  // 1. data (Array, Required)
  // 2. tableColumns (Array, Required)
  // 3. title (String, Required)
  // 4. showSearchBox (Boolean, Optional)
  // 5. searchColumns (Array of Strings, Required if Search is enabled)
  // 6. initialSelection (an array of indices, Optional)
  // 7. ableToSelectAll (Boolean, Optional)
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
    console.log("event ", event);
    // handle single select or multiple select depending on the table needs
    // Becasue the filter will change the index we need to get the object and then get the index of the object from the initial data
    // const selectedIndex = selected.indexOf(id);
    const objSelected = filteredData[id];
    const selectedIndex = props.data.findIndex(
      (obj) => obj.layer === objSelected.layer
    );
    const itemSelected = selected.indexOf(selectedIndex);

    console.log("objSelected ", objSelected);
    console.log("selectedIndex ", selectedIndex);
    let newSelected;
    if (props.ableToSelectAll) {
      newSelected = [...selected];
      itemSelected === -1
        ? newSelected.push(selectedIndex)
        : newSelected.splice(selectedIndex, 1);
    } else {
      newSelected = [];
      itemSelected === -1
        ? newSelected.push(selectedIndex)
        : newSelected.splice(selectedIndex, 1);
    }
    console.log("newSelected ", newSelected);
    setSelected(newSelected);
    props.updateSelection(newSelected);
  };

  const isSelected = (objToCheck) => {
    const getIndexOfObject = indexOfObjInArray(objToCheck, props.data);
    selected.indexOf(getIndexOfObject) !== -1;
  };

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
          key={`BpTable-${props.title}`}
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
              const isItemSelected = isSelected(row);
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

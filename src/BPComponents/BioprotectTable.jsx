import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  descendingComparator,
  getComparator,
  objInArray,
  stableSort,
} from "../Helpers";
import { useDispatch, useSelector } from "react-redux";

import AppBarIcon from "../MenuBar/AppBarIcon";
import BPTableHeadWithSort from "./BPTableHeadWithSort";
import BPTableTitleWithSearch from "./BPTableTitleWithSearch";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";

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
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("category");
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize the incoming `selected` into a Set of IDs for fast lookup.
  const selectedIdSet = useMemo(() => {
    const sel = props.selected || [];
    // supports array of IDs or array of objects with .id
    return new Set(sel.map((s) => (typeof s === "object" ? s.id : s)));
  }, [props.selected]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return stableSort(props.data, getComparator(order, orderBy));
    }
    const lowerCaseQuery = searchQuery.toLowerCase();

    const filteredResult = props.data.filter((row) =>
      props.searchColumns.some((column) =>
        row[column].toString().toLowerCase().includes(lowerCaseQuery)
      )
    );
    return stableSort(filteredResult, getComparator(order, orderBy));
  }, [searchQuery, props.data, order, orderBy]);

  // Let parent know what rows are visible (useful for shift-select logic)
  // useEffect(() => {
  //   props.dataFiltered && props.dataFiltered(filteredData);
  // }, [filteredData, props.dataFiltered]);

  const lastSent = useRef([]);
  useEffect(() => {
    if (!props.dataFiltered) return;
    const a = lastSent.current;
    const b = filteredData;
    const sameLength = a.length === b.length;
    const sameIds = sameLength && a.every((row, i) => row?.id === b[i]?.id);
    if (!sameLength || !sameIds) {
      props.dataFiltered(b);
      lastSent.current = b;
    }
  }, [filteredData, props.dataFiltered]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // const newSelected = props.data.map((obj) => obj);
      // props.updateSelection(newSelected);
      // Prefer to send a list of IDs if caller passed IDs as `selected`
      const newSelectedIds = props.data.map((r) => r.id);
      if (props.updateSelection) {
        // backward compat - caller expects objects
        props.updateSelection(props.data);
      }
      if (props.updateSelectionIds) {
        props.updateSelectionIds(newSelectedIds);
      }
      return;
    }
    // props.updateSelection([]);
    props.updateSelection && props.updateSelection([]);
    props.updateSelectionIds && props.updateSelectionIds([]);
  };

  // should really be item in Object because were checking an obj. poor naming by me.
  // const isSelected = (objToCheck) => {
  //   if (!props.selected || props.selected.length === 0) return false;

  //   if (props.isProject) {
  //     return objToCheck.id === props.selected[0]?.id;
  //   }
  //   return objInArray(objToCheck, props.selected);
  // };
  // Unified selected check (IDs set)
  const isSelected = (row) => selectedIdSet.has(row.id);

  // const visibleRows = useMemo(
  //   () => stableSort(filteredData, getComparator(order, orderBy)),
  //   [props.data, order, orderBy]
  // );
  // const visibleRows = useMemo(
  //   () => stableSort(filteredData, getComparator(order, orderBy)),
  //   [filteredData, order, orderBy]
  // );

  return (
    <Box sx={{ width: "100%" }}>
      <BPTableTitleWithSearch
        numSelected={props.selected.length || 0}
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
            numSelected={props.selected.length || 0}
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
                  onClick={(event) => props.clickRow(event, row)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id ?? idx}
                  selected={isItemSelected}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      // checked={(isItemSelected ? "checked" : "")}
                      inputProps={{
                        "aria-labelledby": labelId,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => props.clickRow(e, row)}
                    />
                  </TableCell>
                  {props.tableColumns.map((column) => (
                    <TableCell
                      key={`${row.id || idx}-${column.id}`}
                      align="left"
                    >
                      {row[column.id]}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{ cursor: "pointer", color: "primary.main" }}

                  >
                    <AppBarIcon
                      icon={faMagnifyingGlassPlus}
                      onClick={(e) => {
                        e.stopPropagation();         // don’t also trigger row click
                        props.preview?.(row);        // call the preview callback
                      }}
                      title="Priview this feature"
                    />
                    Preview
                  </TableCell>
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

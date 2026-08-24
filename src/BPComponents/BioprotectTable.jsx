import { getComparator, stableSort } from "../Helpers";
import { useEffect, useMemo, useRef, useState } from "react";

import BPTableHeadWithSort from "./BPTableHeadWithSort";
import BPTableTitleWithSearch from "./BPTableTitleWithSearch";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import MapIcon from "@mui/icons-material/Map";
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
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("category");
  const [searchQuery, setSearchQuery] = useState("");

  const parseCreatedAt = (value) => {
    if (!value) return null;
    const [d, m, y, ...rest] = value.replace(" ", "/").split("/");
    const [hh, mm, ss] = rest[0].split(":");
    const year = 2000 + Number(y); // "20" -> 2020
    return new Date(
      year,
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      Number(ss),
    );
  };

  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === "creation_date") {
      const aDate = parseCreatedAt(a[orderBy]);
      const bDate = parseCreatedAt(b[orderBy]);
      const aTs = aDate ? aDate.getTime() : 0;
      const bTs = bDate ? bDate.getTime() : 0;
      if (bTs < aTs) return -1;
      if (bTs > aTs) return 1;
      return 0;
    }

    // existing generic logic for other fields
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) =>
    order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);

  // Normalize the incoming `selected` into a Set of IDs for fast lookup.
  const selectedIdSet = useMemo(() => {
    // ponytail: drop nullish entries - a [undefined] selection used to match
    // every row whose .id was also undefined (i.e. all of them)
    const sel = (props.selected || []).filter((s) => s != null);
    // supports array of IDs, or objects with .id (falling back to identity)
    return new Set(sel.map((s) => (typeof s === "object" ? (s.id ?? s) : s)));
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
        row[column].toString().toLowerCase().includes(lowerCaseQuery),
      ),
    );
    return stableSort(filteredResult, getComparator(order, orderBy));
  }, [searchQuery, props.data, order, orderBy]);

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

  const isSelected = (row) => selectedIdSet.has(row.id ?? row);

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
                  {props.preview && (
                    <TableCell
                      align="center"
                      sx={{ cursor: "pointer", color: "primary.main" }}
                    >
                      <IconButton
                        color="primary"
                        size="small"
                        title="Preview this feature"
                        onClick={(e) => {
                          e.stopPropagation(); // don’t also trigger row click
                          props.preview?.(row); // call the preview callback
                        }}
                      >
                        <MapIcon />
                      </IconButton>
                    </TableCell>
                  )}
                  {props.deleteRow &&
                    (() => {
                      const canDelete = props.canDeleteRow
                        ? !!props.canDeleteRow(row)
                        : true;
                      const reason =
                        typeof props.deleteRowReason === "function"
                          ? props.deleteRowReason(row)
                          : null;
                      return (
                        <TableCell
                          align="center"
                          sx={{
                            cursor: canDelete ? "pointer" : "not-allowed",
                            color: canDelete ? "error.main" : "text.disabled",
                          }}
                        >
                          <IconButton
                            color="error"
                            disabled={!canDelete}
                            size="small"
                            title={
                              canDelete
                                ? "Delete this row"
                                : reason || "You cannot delete this row"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canDelete) return;
                              props.deleteRow(row);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      );
                    })()}
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

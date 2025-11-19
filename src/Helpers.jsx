/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
// returns a boolean if it is a valid number
export const isNumber = (str) => /^\d+$/.test(str);

export const isValidTargetValue = (value) =>
  isNumber(value) && value >= 0 && value <= 100;

export const getMaxNumberOfClasses = (brew, colorCode) => {
  const colorScheme = brew.colorSchemes[colorCode];
  const numbers = Object.keys(colorScheme)
    .filter((key) => key !== "properties")
    .map(Number);
  return Math.max(...numbers);
};

export const getArea = (
  value,
  units = "Km2",
  asHtml = false,
  sf = 3,
  addCommas = true
) => {
  if (value == null || Number.isNaN(value))
    return asHtml ? <span>—</span> : "—";

  const u = String(units || "Km2").toLowerCase();

  // Define the scale based on units
  const scales = {
    m2: 1,
    Ha: 0.0001,
    Km2: 0.000001,
  };

  const scale = scales[u] ?? scales["Km2"];
  const converted = value * scale;
  const roundSig = (num, sig) => {
    if (num === 0) return 0;
    const p = Math.ceil(Math.log10(Math.abs(num)));
    const f = Math.pow(10, sig - p);
    return Math.round(num * f) / f;
  };
  const n = roundSig(converted, sf);

  // Add commas if needed
  const fmt = (num) =>
    addCommas
      ? Number(num).toLocaleString(undefined, {
          maximumFractionDigits: Math.max(0, sf),
        })
      : String(num);

  const unitLabel = u === "m2" ? "m²" : u === "ha" ? "ha" : "km²";
  const text = `${fmt(n)} ${unitLabel}`;

  if (!asHtml) return text;
  // For JSX contexts (like your Typography) return a span:
  return <span>{text}</span>;
};

//zooms the passed map to the passed bounds
export const zoomToBounds = (map, bounds) => {
  // Adjust the bounds if they span the dateline
  let minLng = bounds[0] === -180 ? 179 : bounds[0];
  let maxLng = bounds[2];

  if (bounds[0] < 0 && bounds[2] > 0) {
    // Calculate the span across the meridian vs. the dateline
    const lngSpanAcrossMeridian = bounds[2] - bounds[0];
    const lngSpanAcrossDateline = bounds[0] + 180 + (180 - bounds[2]);

    // Set the minLng and maxLng based on the smaller range
    if (lngSpanAcrossMeridian > lngSpanAcrossDateline) {
      minLng = bounds[2];
      maxLng = bounds[0] + 360;
    }
  }

  // Fit the map bounds with padding and easing
  map.current.fitBounds([minLng, bounds[1], maxLng, bounds[3]], {
    padding: { top: 10, bottom: 10, left: 10, right: 10 },
    easing: (num) => 1, // This line returns 1 for all values, indicating no easing
  });
};

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
export const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

export const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

export const generateTableCols = (fields, overrides = {}) => {
  // generate base table columns with default vals. If you want to override the defaults use
  // const overrides = {
  //   name: { numeric: true, disablePadding: false },
  //   source: { disablePadding: false }
  // };
  return fields.map((field) => ({
    ...field,
    numeric: overrides[field.id]?.numeric ?? false,
    disablePadding: overrides[field.id]?.disablePadding ?? true,
  }));
};

// Function to deeply compare two objects, ignoring the order of keys
export const checkObjInArray = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  )
    return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => checkObjInArray(obj1[key], obj2[key]));
};

export const isValueInObject = (obj, value) =>
  Object.values(obj).includes(value);

// Function to find the index of the matching object from array1 in array2
export const objInArray = (object, array) => {
  return array.some((item) => checkObjInArray(object, item));
};

export const strToBool = (str) => str.toLowerCase() === "true";

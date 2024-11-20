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

export const getArea = (value, units, asHtml, sf = 3, addCommas = true) => {
  // Define the scale based on units
  const scales = {
    m2: 1,
    Ha: 0.0001,
    Km2: 0.000001,
  };

  const scale = scales[units] || 1; // Default to scale of 1 if units are not matched
  let formattedValue = (value * scale).toPrecision(sf);

  // Add commas if needed
  if (addCommas && Number(formattedValue) > 1000) {
    formattedValue = formattedValue
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Format units with superscript for squared units
  const formattedUnits = units.includes("2") ? (
    <span>
      {units.replace("2", "")}
      <sup>2</sup>
    </span>
  ) : (
    <span>{units}</span>
  );

  // Return formatted value as HTML or plain text
  return asHtml ? (
    <span>
      {formattedValue} {formattedUnits}
    </span>
  ) : (
    `${formattedValue} ${units}`
  );
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
  console.log("obj1 ", obj1, obj2);
  if (
    typeof obj1 === "object" &&
    obj1 !== null &&
    typeof obj2 === "object" &&
    obj2 !== null
  ) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => checkObjInArray(obj1[key], obj2[key]));
  } else {
    return obj1 === obj2;
  }
};

export const isValueInObject = (obj, value) =>
  Object.values(obj).includes(value);

// Function to find the index of the matching object from array1 in array2
export const objInArray = (object, array) => {
  return array.some((item) => isValueInObject(object, item));
};

export const strToBool = (str) => str.toLowerCase() === "true";

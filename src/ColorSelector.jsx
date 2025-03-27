import MenuItem from "@mui/material/MenuItem";
import React from "react";
import Select from "@mui/material/Select";
import { getMaxNumberOfClasses } from "./Helpers";

const ColorSelector = ({ values, property, brew, changeValue }) => {
  console.log("{ values, property, brew, changeValue } ", {
    values,
    property,
    brew,
    changeValue,
  });
  // Handle change in selection
  const handleChange = (event) => {
    changeValue(event.target.value);
  };

  // Render color swatches inside the dropdown
  const getSwatch = (colorCode, disableHighlight) => {
    // Get the number of classes the user currently has selected
    // Get the maximum number of colors in this scheme
    // Get the color scheme
    // Get the number of colors to show as an array
    let numClasses = brew.getNumClasses();
    let colorSchemeLength = getMaxNumberOfClasses(brew, colorCode);
    let colorScheme = brew.colorSchemes[colorCode];
    let numClassesArray =
      numClasses <= colorSchemeLength
        ? Array.from({ length: numClasses })
        : Array.from({ length: colorSchemeLength });

    let divWidth = 112 / numClassesArray.length;
    let colorDivs = numClassesArray.map((item, idx) => (
      <div
        key={index + idx}
        style={{
          backgroundColor: colorScheme[numClassesArray.length][item],
          width: divWidth,
          height: "16px",
          display: "inline-block",
        }}
      />
    ));

    let borderColor =
      colorCode === property && !disableHighlight
        ? "rgb(255, 64, 129)"
        : "lightgray";

    return (
      <div
        style={{
          display: "inline-flex",
          marginTop: "12px",
          border: `1px solid ${borderColor}`,
        }}
      >
        {colorDivs}
      </div>
    );
  };

  return (
    <Select
      value={property}
      onChange={handleChange}
      // renderValue={getSwatch(property, true)}
      style={{ width: "150px", margin: "0px 10px" }}
    >
      {values.map((colorCode) => (
        <MenuItem key={colorCode} value={colorCode}>
          {colorCode !== "opacity" ? getSwatch(colorCode, false) : "Opacity"}
        </MenuItem>
      ))}
    </Select>
  );
};

export default ColorSelector;

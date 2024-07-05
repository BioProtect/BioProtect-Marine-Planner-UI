import MenuItem from "@mui/material/MenuItem";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import Select from "@mui/material/Select";
import { getMaxNumberOfClasses } from "./Helpers.js";

class ColorSelector extends React.Component {
  handleChange(event, index, value) {
    this.props.changeValue(value);
  }
  selectionRenderer() {
    let c = this.getSwatch(this.props.property, true);
    return c;
  }
  getSwatch(colorCode, disableHighlight) {
    //get the number of classes the user currently has selected
    let numClasses = this.props.brew.getNumClasses();
    //get the maximum number of colors in this scheme
    let colorSchemeLength = getMaxNumberOfClasses(this.props.brew, colorCode);
    //get the color scheme
    let colorScheme = this.props.brew.colorSchemes[colorCode];
    //get the number of colors to show as an array
    let numClassesArray =
      numClasses <= colorSchemeLength
        ? Array.apply(null, { length: numClasses }).map(Number.call, Number)
        : Array.apply(null, { length: colorSchemeLength }).map(
            Number.call,
            Number
          );
    let classesToShow = numClassesArray.length;
    let divWidth = 112 / classesToShow;
    let colorDivs = numClassesArray.map((item) => {
      return (
        <div
          key={item}
          style={{
            backgroundColor: colorScheme[classesToShow][item],
            width: divWidth,
            height: "16px",
            display: "inline-block",
          }}
        />
      );
    });
    let borderColor =
      colorCode === this.props.property && !disableHighlight
        ? "rgb(255, 64, 129)"
        : "lightgray";
    colorDivs = (
      <div
        style={{
          display: "inline-flex",
          marginTop: "12px",
          border: "1px solid " + borderColor,
        }}
      >
        {colorDivs}
      </div>
    );
    return colorDivs;
  }
  render() {
    let primaryText;
    let c = this.props.values.map(function (colorCode) {
      colorCode !== "opacity" ? (primaryText = "") : (primaryText = "Opacity");
      let _c =
        colorCode !== "opacity" ? this.getSwatch(colorCode, false) : null;
      return (
        <MenuItem
          value={colorCode}
          primaryText={primaryText}
          key={colorCode}
          title={colorCode}
        >
          {_c}
        </MenuItem>
      );
    }, this);
    return (
      <Select
        selectionRenderer={this.selectionRenderer.bind(this)}
        menuItemStyle={{ fontSize: "12px" }}
        labelStyle={{ fontSize: "12px" }}
        listStyle={{ fontSize: "12px" }}
        style={{ width: "150px", margin: "0px 10px" }}
        autoWidth={true}
        floatingLabelText={this.props.floatingLabelText}
        floatingLabelFixed={true}
        onChange={this.handleChange.bind(this)}
        value={this.props.property}
      >
        {c}
      </Select>
    );
  }
}

export default ColorSelector;

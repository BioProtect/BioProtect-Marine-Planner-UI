import MenuItem from "@mui/material/MenuItem";
import React from "react";
import Select from "@mui/material/Select";

const RendererSelector = (props) => {
  console.log("props selection renderer", props);
  const handleChange = (event) => {
    props.changeValue(event.target.value);
  };

  const items = props.values.map((item) => {
    let primaryText;
    typeof item === "string"
      ? item.charAt(0).toUpperCase() + item.slice(1).replace("_", " ")
      : item.toString();

    return (
      <MenuItem value={item} key={item}>
        {primaryText}
      </MenuItem>
    );
  });

  return (
    <Select
      // renderValue={props.selectionRenderer}
      style={{ width: "150px", margin: "0px 10px" }}
      onChange={handleChange}
      value={props.property}
    >
      {items}
    </Select>
  );
};

export default RendererSelector;

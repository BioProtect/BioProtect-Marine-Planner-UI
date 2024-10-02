import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import React from "react";

const BioprotectSelect = ({
  label,
  options,
  changeFunc,
  id,
  displayField,
  disabled = false,
}) => {
  const handleChanges = (value) => {
    console.log("value ", value);
    changeFunc(value);
  };
  return options && options.length > 0 ? (
    <FormControl fullWidth variant="outlined" margin="normal">
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        fullWidth
        onChange={(e) => handleChanges(e.target.value)}
        label={label}
        disabled={disabled}
      >
        {options.map((option) => (
          <MenuItem value={option.iso3 || option} key={option.iso3 || option}>
            {option[displayField] ||
              `${option}${
                label === "Area of each planning unit" ? " Km2" : ""
              }`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null;
};

export default BioprotectSelect;

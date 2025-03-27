import Checkbox from "@mui/material/Checkbox";
import React from "react";

const CheckBoxField = ({ checked, onChange, interestFeature }) => {
  // Pass all Conservation features props in click event of checkbox so we can store array of checked Conservation features
  const handleCheck = (event) =>
    onChange(event, event.target.checked, interestFeature);

  return (
    <Checkbox
      onChange={handleCheck}
      checked={checked}
      sx={{ position: "absolute", left: "10px" }} // Using sx for MUI styling
    />
  );
};

export default CheckBoxField;

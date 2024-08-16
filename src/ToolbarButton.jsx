import Button from "@mui/material/Button";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";

const ToolbarButton = (props) => {
  // Merge any user-passed style
  let _style1 = props.style ? { ...props.style } : {};
  let _style2 = {
    display: props.show !== false ? "inline-block" : "none",
    marginLeft: "4px",
    marginRight: "4px",
    padding: "0px",
    minWidth: "30px",
    width: props.label ? "" : "24px",
    height: "24px",
  };
  Object.assign(_style1, _style2);

  // return <Button {...props} variant="contained" style={_style1} />;
  return (
    <Button {...props} variant="contained" style={_style1}>
      {props.title}
    </Button>
  );
};

export default ToolbarButton;

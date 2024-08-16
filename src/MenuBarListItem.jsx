import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import React from "react";

const MenuBarListItem = (props) => {
  return (
    <MenuItem onClick={props.handleClick} title={props.title}>
      <ListItemIcon>
        <FontAwesomeIcon
          style={{ fontSize: "20px", marginRight: "10px" }}
          icon={props.icon}
        />
      </ListItemIcon>
      <ListItemText>{props.text}</ListItemText>
    </MenuItem>
  );
};

export default MenuBarListItem;

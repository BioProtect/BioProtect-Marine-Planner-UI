import {
  faInfoCircle,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

import CONSTANTS from "./constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Menu from "@mui/material/Menu";
import MenuBarListItem from "./MenuBarListItem";
import MenuItem from "@mui/material/MenuItem";
import React from "react";

const HelpMenu = (props) => {
  const openDocumentation = () => {
    window.open(CONSTANTS.DOCS_ROOT);
  };

  return (
    <Menu
      open={props.open}
      anchorEl={props.menuAnchor}
      onClose={props.hideHelpMenu}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            left: 10,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
    >
      <MenuBarListItem
        handleClick={openDocumentation}
        title="Documentation"
        icon={faQuestionCircle}
        text="Documentation"
      />
      <MenuBarListItem
        handleClick={props.openAboutDialog}
        title="About"
        icon={faInfoCircle}
        text="About"
      />
    </Menu>
  );
};

export default HelpMenu;

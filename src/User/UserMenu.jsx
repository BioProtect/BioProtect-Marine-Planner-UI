import {
  faCog,
  faEdit,
  faSignOut,
  faUserLock,
} from "@fortawesome/free-solid-svg-icons";

import Menu from "@mui/material/Menu";
import MenuBarListItem from "../MenuBarListItem";
import React from "react";

const UserMenu = (props) => {
  return (
    <Menu
      open={props.open}
      anchorEl={props.menuAnchor}
      onClose={props.hideUserMenu}
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
            right: 10,
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
        handleClick={props.openUserSettingsDialog}
        title="Settings"
        icon={faCog}
        text="Settings"
      />
      <MenuBarListItem
        handleClick={props.openProfileDialog}
        title="Profile"
        icon={faEdit}
        text="Profile"
      />

      <MenuBarListItem
        handleClick={props.openChangePasswordDialog}
        title="Change password"
        icon={faUserLock}
        text="Change password"
      />
      <MenuBarListItem
        handleClick={props.logout}
        title="Log out"
        icon={faSignOut}
        text="Log out"
      />
    </Menu>
  );
};

export default UserMenu;

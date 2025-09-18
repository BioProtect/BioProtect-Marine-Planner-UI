import {
  faCog,
  faEdit,
  faSignOut,
  faUserLock,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

import Menu from "@mui/material/Menu";
import MenuBarListItem from "../MenuBarListItem";
import React from "react";
import { toggleDialog } from "@slices/uiSlice";

const UserMenu = (props) => {
  const dispatch = useDispatch();
  const projectState = useSelector((state) => state.project);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const userState = useSelector((state) => state.user);


  const closeDialog = () =>
    dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));

  const handleChangePassword = () => {
    dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));
    dispatch(
      toggleDialog({ dialogName: "changePasswordDialogOpen", isOpen: true })
    );
  };

  const openUserSettingsDialog = () => {
    dispatch(
      toggleDialog({ dialogName: "userSettingsDialogOpen", isOpen: true })
    );
    dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));
  };

  const openProfileDialog = () => {
    dispatch(toggleDialog({ dialogName: "profileDialogOpen", isOpen: true }));
    dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));
  };

  return (
    <Menu
      open={dialogStates.userMenuOpen}
      anchorEl={props.menuAnchor}
      onClose={closeDialog}
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
        handleClick={openUserSettingsDialog}
        title="Settings"
        icon={faCog}
        text="Settings"
      />
      <MenuBarListItem
        handleClick={openProfileDialog}
        title="Profile"
        icon={faEdit}
        text="Profile"
      />

      <MenuBarListItem
        handleClick={handleChangePassword}
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

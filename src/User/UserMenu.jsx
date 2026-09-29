import { useDispatch, useSelector } from "react-redux";

import EditIcon from "@mui/icons-material/Edit";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LogoutIcon from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PasswordIcon from "@mui/icons-material/Password";
import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import { toggleDialog } from "@slices/uiSlice";

const UserMenu = ({ menuAnchor, logout }) => {
  const dispatch = useDispatch();
  const projectState = useSelector((state) => state.project);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const userState = useSelector((state) => state.user);

  const closeDialog = () =>
    dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));

  const handleChangePassword = () => {
    dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));
    dispatch(
      toggleDialog({ dialogName: "changePasswordDialogOpen", isOpen: true }),
    );
  };

  const openUserSettingsDialog = () => {
    dispatch(
      toggleDialog({ dialogName: "userSettingsDialogOpen", isOpen: true }),
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
      anchorEl={menuAnchor}
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
      <MenuItem onClick={openUserSettingsDialog} title="Settings">
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>
      <MenuItem onClick={openProfileDialog} title="Profile">
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleChangePassword} title="Change password">
        <ListItemIcon>
          <PasswordIcon />
        </ListItemIcon>
        <ListItemText>Change password</ListItemText>
      </MenuItem>
      <MenuItem onClick={logout} title="Log out">
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText>Log out</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;

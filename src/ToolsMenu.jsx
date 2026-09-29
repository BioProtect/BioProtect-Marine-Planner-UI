import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AssessmentIcon from "@mui/icons-material/Assessment";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import GroupIcon from "@mui/icons-material/Group";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { toggleDialog } from "@slices/uiSlice";

const ToolsMenu = (props) => {
  const dispatch = useDispatch();
  const [selectOpen, setSelectOpen] = useState(false);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectState = useSelector((state) => state.project);

  const openUsersDialog = useCallback(() => {
    props.openUsersDialog();
    closeDialog();
  }, [props]);

  const openGapAnalysisDialog = useCallback(() => {
    props.openGapAnalysisDialog();
    closeDialog();
  }, [props]);

  const openResetDialog = useCallback(() => {
    dispatch(toggleDialog({ dialogName: "resetDialogOpen", isOpen: true }));
    closeDialog();
  }, []);

  const closeDialog = () =>
    dispatch(toggleDialog({ dialogName: "toolsMenuOpen", isOpen: false }));

  return (
    <Menu
      open={dialogStates.toolsMenuOpen}
      anchorEl={props.menuAnchor}
      onClose={() => closeDialog()}
      slotProps={{
        paper: {
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
              left: 5,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        },
      }}
    >
      {props.userRole === "Admin" && (
        <MenuItem onClick={openUsersDialog} title="Manage Users">
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText>Users</ListItemText>
        </MenuItem>
      )}
      {props.userRole === "Admin" && projectState.bpServer.enable_reset && (
        <MenuItem onClick={openResetDialog} title="Reset database">
          <ListItemIcon>
            <ManageHistoryIcon />
          </ListItemIcon>
          <ListItemText>Reset database</ListItemText>
        </MenuItem>
      )}
      {props.userRole !== "ReadOnly" && (
        <MenuItem
          onClick={openGapAnalysisDialog}
          title={
            props.metadata.pu_country === null
              ? "Gap Analysis (not available)"
              : "Gap Analysis"
          }
          disabled={props.metadata.pu_country === null}
        >
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText>Gap Analysis</ListItemText>
        </MenuItem>
      )}
      {props.userRole === "Admin" && (
        <MenuItem onClick={props.cleanup} title="Cleanup server">
          <ListItemIcon>
            <CleaningServicesIcon />
          </ListItemIcon>
          <ListItemText>Cleanup server</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default ToolsMenu;

import React, { useCallback, useState } from "react";
import {
  faBroom,
  faChartBar,
  faHistory,
  faRunning,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

import Menu from "@mui/material/Menu";
import MenuBarListItem from "./MenuBarListItem";
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

  const openRunLogDialog = useCallback(() => {
    props.openRunLogDialog();
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
        <MenuBarListItem
          handleClick={openUsersDialog}
          title="Manage Users"
          icon={faUsers}
          text="Users"
        />
      )}
      {props.userRole === "Admin" && projectState.bpServer.enable_reset && (
        <MenuBarListItem
          handleClick={openResetDialog}
          title="Reset database"
          icon={faHistory}
          text="Reset"
        />
      )}
      <MenuBarListItem
        handleClick={openRunLogDialog}
        title={
          props.userRole === "Admin"
            ? "View Run Log and stop runs"
            : "View Run Log"
        }
        icon={faRunning}
        text="Run log"
      />
      {props.userRole !== "ReadOnly" && (
        <MenuBarListItem
          handleClick={openGapAnalysisDialog}
          title="Gap Analysis"
          icon={faChartBar}
          text={
            props.metadata.pu_country === null
              ? "Gap Analysis (not available)"
              : "Gap Analysis"
          }
          disabled={props.metadata.pu_country === null}
        />
      )}
      {props.userRole === "Admin" && (
        <MenuBarListItem
          handleClick={props.cleanup}
          title="Cleanup server"
          icon={faBroom}
          text="Cleanup server"
        />
      )}
    </Menu>
  );
};

export default ToolsMenu;

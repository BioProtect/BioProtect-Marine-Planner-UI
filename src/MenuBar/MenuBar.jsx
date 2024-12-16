import React, { useCallback, useState } from "react";
import {
  faArrowAltCircleLeft as a,
  faArrowAltCircleRight as b,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faBookOpen,
  faGlobeEurope,
  faLayerGroup,
  faQuestionCircle,
  faStar,
  faThLarge,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

import AppBar from "@mui/material/AppBar";
import AppBarIcon from "./AppBarIcon";
import Avatar from "@mui/material/Avatar";
import BioLogo from "../images/bioprotect_some_bkgrnd.png";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { toggleDialog } from "../slices/uiSlice";

const MenuBar = (props) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectState = useSelector((state) => state.project);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  //opens the features dialog without the ability to add/remove features (i.e. different from the dialog that is opened from a project)
  const openFeaturesDialog = useCallback(
    (evt) => {
      props.openFeaturesDialog(false);
    },
    [props]
  );

  const hanldeMenuOpen = (e, val) => {
    e.preventDefault();
    setMenuAnchor(e.currentTarget);
    dispatch(toggleDialog({ dialogName: val, isOpen: true }));
  };

  const openDialog = (e, val) => {
    dispatch(toggleDialog({ dialogName: val, isOpen: true }));
    dispatch(toggleDialog({ dialogName: "helpMenuOpen", isOpen: false }));
  };

  const togglePanel = (e, val) => {
    const valueToToggle =
      val === "infoPanelOpen"
        ? dialogStates.infoPanelOpen
        : dialogStates.resultsPanelOpen;
    dispatch(
      toggleDialog({
        dialogName: val,
        isOpen: !valueToToggle,
      })
    );
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: props.open ? "block" : "none",
      }}
    >
      <AppBar position="static">
        <Toolbar
          sx={{ backgroundColor: "rgb(0, 188, 212)", maxHeight: "60px" }}
        >
          <Avatar alt="BioProtect Logo" src={BioLogo} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <AppBarIcon
              icon={faBookOpen}
              onClick={() => props.openProjectsDialog()}
              title="Projects"
            />
            <AppBarIcon
              icon={faStar}
              onClick={() => openFeaturesDialog()}
              title="Features"
            />
            <AppBarIcon
              icon={faThLarge}
              onClick={() => props.openPlanningGridsDialog()}
              title="Planning grids"
            />
            <AppBarIcon
              icon={faGlobeEurope}
              onClick={() => props.openAtlasLayersDialog()}
              title="Atlas Layers"
            />
            <AppBarIcon
              icon={faLayerGroup}
              onClick={() => props.openCumulativeImpactDialog()}
              title="Impact"
            />
            <span style={{ width: "16px" }} />
            <AppBarIcon
              icon={dialogStates.infoPanelOpen ? faArrowAltCircleLeft : a}
              onClick={(e) => togglePanel(e, "infoPanelOpen")}
              title={
                dialogStates.infoPanelOpen
                  ? "Hide the project window"
                  : "Show the project window"
              }
            />
            <AppBarIcon
              icon={dialogStates.resultsPanelOpen ? faArrowAltCircleRight : b}
              onClick={(e) => togglePanel(e, "resultsPanelOpen")}
              title={
                dialogStates.resultsPanelOpen
                  ? "Hide the results window"
                  : "Show the results window"
              }
            />
            <span style={{ width: "16px" }} />
            <AppBarIcon
              icon={faWrench}
              title={"Tools and analysis"}
              onClick={(e) => hanldeMenuOpen(e, "toolsMenuOpen")}
            />
            <AppBarIcon
              icon={faQuestionCircle}
              title={"Help and support"}
              onClick={(e) => hanldeMenuOpen(e, "helpMenuOpen")}
            />
          </Typography>
          <Button
            color="inherit"
            className={"marxanServer"}
            title={"Click to open the Server Details window"}
            onClick={(e) => openDialog(e, "serverDetailsDialogOpen")}
          >
            {projectState.bpServer.name}
          </Button>
          <Button
            color="inherit"
            className={"username"}
            title={"Click to open the User menu"}
            onClick={(e) => hanldeMenuOpen(e, "userMenuOpen")}
          >
            {props.user}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default MenuBar;

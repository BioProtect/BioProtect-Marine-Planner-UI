/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
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

import AppBar from "@mui/material/AppBar";
import AppBarIcon from "./AppBarIcon";
import Avatar from "@mui/material/Avatar";
import BioLogo from "../images/bioprotect_some_bkgrnd.png";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const MenuBar = (props) => {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  //opens the features dialog without the ability to add/remove features (i.e. different from the dialog that is opened from a project)
  const openFeaturesDialog = useCallback(
    (evt) => {
      props.openFeaturesDialog(false);
    },
    [props]
  );

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
              onClick={props.openCumulativeImpactDialog}
              title="Impact"
            />
            <span style={{ width: "16px" }} />
            <AppBarIcon
              icon={props.infoPanelOpen ? faArrowAltCircleLeft : a}
              onClick={props.toggleInfoPanel}
              title={
                props.infoPanelOpen
                  ? "Hide the project window"
                  : "Show the project window"
              }
            />
            <AppBarIcon
              icon={props.resultsPanelOpen ? faArrowAltCircleRight : b}
              onClick={props.toggleResultsPanel}
              title={
                props.resultsPanelOpen
                  ? "Hide the results window"
                  : "Show the results window"
              }
            />
            <span style={{ width: "16px" }} />
            <AppBarIcon
              icon={faWrench}
              onClick={props.showToolsMenu}
              title={"Tools and analysis"}
            />
            <AppBarIcon
              icon={faQuestionCircle}
              onClick={props.showHelpMenu}
              title={"Help and support"}
            />
          </Typography>
          <Button
            color="inherit"
            className={"marxanServer"}
            title={"Click to open the Server Details window"}
            onClick={props.openServerDetailsDialog}
          >
            {props.marxanServer}
          </Button>
          <Button
            color="inherit"
            className={"username"}
            title={"Click to open the User menu"}
            onClick={props.showUserMenu}
          >
            {props.user}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default MenuBar;

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

import AppBarIcon from "./AppBarIcon";
import Toolbar from "@mui/material/Toolbar";

const AppBar = (props) => {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  //opens the features dialog without the ability to add/remove features (i.e. different from the dialog that is opened from a project)
  //opens the features dialog without the ability to add/remove features (i.e. different from the dialog that is opened from a project)
  const openFeaturesDialog = useCallback(
    (evt) => {
      props.openFeaturesDialog(false);
    },
    [props]
  );

  return (
    <Toolbar
      style={{
        display: props.open ? "block" : "none",
        backgroundColor: "rgb(0, 188, 212)",
        height: "62px",
        padding: "2px 10px 0px 10px",
      }}
      className={"appBar"}
    >
      <div>
        <div
          className={"marxanServer"}
          title={"Click to open the Server Details window"}
          onClick={props.openServerDetailsDialog}
        >
          {props.marxanServer}
        </div>
        <div
          className={"username"}
          title={"Click to open the User menu"}
          onClick={props.showUserMenu}
        >
          {props.user}
        </div>
      </div>
      <AppBarIcon
        icon={faBookOpen}
        onClick={props.openProjectsDialog}
        title="Projects"
      />
      <AppBarIcon
        icon={faStar}
        onClick={() => openFeaturesDialog()}
        title="Features"
      />
      <AppBarIcon
        icon={faThLarge}
        onClick={props.openPlanningGridsDialog.bind(this)}
        title="Planning grids"
      />
      <AppBarIcon
        icon={faGlobeEurope}
        onClick={props.openAtlasLayersDialog}
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
    </Toolbar>
  );
};

export default AppBar;

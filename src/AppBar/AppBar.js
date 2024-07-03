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
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import Toolbar from "@mui/material/Toolbar";

class AppBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { adminMenuOpen: false };
  }
  //opens the features dialog without the ability to add/remove features (i.e. different from the dialog that is opened from a project)
  openFeaturesDialog(evt) {
    this.props.openFeaturesDialog(false);
  }
  render() {
    return (
      <React.Fragment>
        <Toolbar
          style={{
            display: this.props.open ? "block" : "none",
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
              onClick={this.props.openServerDetailsDialog}
            >
              {this.props.marxanServer}
            </div>
            <div
              className={"username"}
              title={"Click to open the User menu"}
              onClick={this.props.showUserMenu}
            >
              {this.props.user}
            </div>
          </div>
          <AppBarIcon
            icon={faBookOpen}
            onClick={this.props.openProjectsDialog}
            title="Projects"
          />
          <AppBarIcon
            icon={faStar}
            onClick={this.openFeaturesDialog.bind(this)}
            title="Features"
          />
          <AppBarIcon
            icon={faThLarge}
            onClick={this.props.openPlanningGridsDialog.bind(this)}
            title="Planning grids"
          />
          <AppBarIcon
            icon={faGlobeEurope}
            onClick={this.props.openAtlasLayersDialog}
            title="Atlas Layers"
          />
          <AppBarIcon
            icon={faLayerGroup}
            onClick={this.props.openCumulativeImpactDialog}
            title="Impact"
          />
          <span style={{ width: "16px" }} />
          <AppBarIcon
            icon={this.props.infoPanelOpen ? faArrowAltCircleLeft : a}
            onClick={this.props.toggleInfoPanel}
            title={
              this.props.infoPanelOpen
                ? "Hide the project window"
                : "Show the project window"
            }
          />
          <AppBarIcon
            icon={this.props.resultsPanelOpen ? faArrowAltCircleRight : b}
            onClick={this.props.toggleResultsPanel}
            title={
              this.props.resultsPanelOpen
                ? "Hide the results window"
                : "Show the results window"
            }
          />
          <span style={{ width: "16px" }} />
          <AppBarIcon
            icon={faWrench}
            onClick={this.props.showToolsMenu}
            title={"Tools and analysis"}
          />
          <AppBarIcon
            icon={faQuestionCircle}
            onClick={this.props.showHelpMenu}
            title={"Help and support"}
          />
        </Toolbar>
      </React.Fragment>
    );
  }
}

export default AppBar;

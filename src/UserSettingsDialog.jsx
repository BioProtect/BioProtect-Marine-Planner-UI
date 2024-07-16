import MarxanDialog from "./MarxanDialog";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import Select from "@mui/material/Select";

class UserSettingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { saveEnabled: false };
    this.options = {};
  }
  setOption(key, value) {
    this.setState({ saveEnabled: true });
    this.options[key] = value;
    this.props.saveOptions(this.options);
  }
  updateOptions() {
    this.props.onOk();
  }
  changeBasemap(event, key, payload) {
    var basemap = this.props.basemaps[key];
    this.props.changeBasemap(basemap);
    this.setOption("BASEMAP", basemap.name);
  }
  toggleUseFeatureColors(evt, isInputChecked) {
    this.setOption("USEFEATURECOLORS", isInputChecked);
  }
  toggleShowWelcomeScreen(evt, isInputChecked) {
    this.setOption("SHOWWELCOMESCREEN", isInputChecked);
  }
  setReportUnit(event, value) {
    this.setOption("REPORTUNITS", value);
  }
  render() {
    return (
      <MarxanDialog
        {...this.props}
        contentWidth={370}
        offsetY={80}
        showCancelButton={false}
        onOk={this.updateOptions.bind(this)}
        helpLink={"user.html#user-settings"}
        title="Settings"
      >
        {
          <div key="k14">
            <Select
              floatingLabelText={"Basemap style"}
              floatingLabelFixed={true}
              underlineShow={false}
              menuItemStyle={{ fontSize: "12px" }}
              labelStyle={{ fontSize: "12px" }}
              style={{ width: "260px" }}
              value={this.props.basemap}
              onChange={this.changeBasemap.bind(this)}
            >
              {this.props.basemaps.map((item) => {
                return (
                  <MenuItem
                    value={item.name}
                    key={item.name}
                    primaryText={item.alias}
                    style={{ fontSize: "12px" }}
                    title={item.description}
                  />
                );
              })}
            </Select>

            <div style={{ paddingBottom: "10px" }}>
              <div className={"userSetting"}>Area units</div>
              <RadioGroup
                name="reportUnitType"
                defaultSelected={this.props.userData.REPORTUNITS}
                onChange={this.setReportUnit.bind(this)}
              >
                <Radio
                  value="m2"
                  label="m2"
                  className={"radioButton"}
                  style={{ width: "60px", display: "inline-block" }}
                  inputStyle={{ width: "40px" }}
                  labelStyle={{ width: "40px" }}
                  iconStyle={{ marginRight: "3px" }}
                />
                <Radio
                  value="Ha"
                  label="Ha"
                  className={"radioButton"}
                  style={{ width: "60px", display: "inline-block" }}
                  inputStyle={{ width: "40px" }}
                  labelStyle={{ width: "40px" }}
                  iconStyle={{ marginRight: "3px" }}
                />
                <Radio
                  value="Km2"
                  label="Km2"
                  className={"radioButton"}
                  style={{ width: "60px", display: "inline-block" }}
                  inputStyle={{ width: "40px" }}
                  labelStyle={{ width: "40px" }}
                  iconStyle={{ marginRight: "3px" }}
                />
              </RadioGroup>
            </div>
            {/*	<Checkbox label="Use feature colours" style={{fontSize:'12px'}} checked={this.props.userData.USEFEATURECOLORS} onCheck={this.toggleUseFeatureColors.bind(this)} />
						<Checkbox label="Show welcome screen at startup" style={{fontSize:'12px'}} checked={this.props.userData.SHOWWELCOMESCREEN} onCheck={this.toggleShowWelcomeScreen.bind(this)} />*/}
          </div>
        }
      </MarxanDialog>
    );
  }
}

export default UserSettingsDialog;

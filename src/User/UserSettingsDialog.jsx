import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Checkbox from "@mui/material/Checkbox";
import { Divider } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MarxanDialog from "../MarxanDialog";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import { selectUserData } from "../slices/authSlice";

const UserSettingsDialog = (props) => {
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [options, setOptions] = useState({});
  const userData = useSelector(selectUserData);

  const setOption = (key, value) => {
    setSaveEnabled(true);
    setOptions((prevOptions) => {
      const newOptions = { ...prevOptions, [key]: value };
      props.saveOptions(newOptions);
      return newOptions;
    });
  };

  const changeBasemap = (event) => {
    const basemap = props.basemaps.find(
      (item) => item.name === event.target.value
    );
    props.changeBasemap(basemap);
    setOption("BASEMAP", basemap.name);
  };

  const toggleUseFeatureColors = (event) => {
    setOption("USEFEATURECOLORS", event.target.checked);
  };

  const toggleShowWelcomeScreen = (event) => {
    setOption("SHOWWELCOMESCREEN", event.target.checked);
  };

  const setReportUnit = (event) => {
    setOption("report_units", event.target.value);
  };

  return (
    <MarxanDialog
      {...props}
      maxWidth="md"
      showCancelButton={false}
      onOk={() => dispatch(toggleDialog({ dialogName: "userSettingsDialogOpen", isOpen: false }))}
      helpLink={"user.html#user-settings"}
      title="Settings"
    >
      <div key="k14">
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="protected-areas-label">Base Map</InputLabel>
          <Select
            labelId="basemap-style-id"
            id="basemap-style"
            value={props.basemap}
            label="Change Basemap"
            fullWidth
            onChange={changeBasemap}
          >
            {props.basemaps.map((item) => (
              <MenuItem
                key={item.name}
                value={item.name}
                style={{ fontSize: "12px" }}
                title={item.description}
              >
                {item.alias}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Divider />
        <FormControl>
          <FormLabel id="reportUnitType-label">Area Units</FormLabel>
          <RadioGroup
            aria-labelledby="reportUnitType-label"
            value={userData.report_units}
            name="reportUnitType"
            onChange={setReportUnit}
          >
            <FormControlLabel value="m2" control={<Radio />} label="m2" />
            <FormControlLabel value="Ha" control={<Radio />} label="Ha" />
            <FormControlLabel value="Km2" control={<Radio />} label="Km2" />
          </RadioGroup>
        </FormControl>
        <Divider />

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={userData.use_feature_colors}
                onChange={toggleUseFeatureColors}
              />
            }
            label="Use Feature Colours"
          />
        </FormGroup>
      </div>
    </MarxanDialog >
  );
};

export default UserSettingsDialog;

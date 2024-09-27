import React, { useState } from "react";

import CONSTANTS from "./constants";
import MarxanDialog from "./MarxanDialog";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const NewPlanningGridDialog = (props) => {
  const [iso3, setIso3] = useState("");
  const [domain, setDomain] = useState("");
  const [shape, setShape] = useState("");
  const [areakm2, setAreaKm2] = useState(undefined);
  const [domainEnabled, setDomainEnabled] = useState(true);

  const handleIso3Change = (value) => {
    if (["FJI", "KIR", "NZL", "RUS", "TUV", "USA", "WLF"].includes(value)) {
      setIso3(undefined);
      // Optionally show an error if the country spans the meridian
      props.setSnackBar(
        "Countries that span the meridian are currently not supported..."
      );
    } else {
      setIso3(value);
    }

    // Automatically set domain to terrestrial only if no marine area exists
    const filteredCountry = props.countries.filter(
      (country) => country.iso3 === value
    );

    if (!filteredCountry.has_marine) {
      handleDomainChange(1); // Assuming '1' corresponds to terrestrial
      setDomainEnabled(false);
    } else {
      setDomainEnabled(true);
    }
  };

  const handleDomainChange = (value) => setDomain(CONSTANTS.DOMAINS[value]);
  const handleShapeChange = (value) => setShape(CONSTANTS.SHAPES[value]);
  const handleAreaKm2Change = (value) => setAreaKm2(CONSTANTS.AREAKM2S[value]);

  const handleOk = () => {
    props
      .createNewPlanningUnitGrid(iso3, domain, areakm2, shape)
      .then(() => {
        props.onCancel(); // Close the dialog after success
      })
      .catch((error) => {
        console.error("Error creating planning grid:", error);
      });
  };

  const dropDownStyle = { width: "240px" };

  return (
    <MarxanDialog
      open={props.open}
      loading={props.loading}
      onOk={handleOk}
      onClose={props.onCancel}
      okDisabled={!iso3 || !domain || !areakm2 || props.loading}
      cancelLabel="Cancel"
      showCancelButton={true}
      helpLink="user.html#creating-new-planning-grids-using-marxan-web"
      title="New planning grid"
    >
      <React.Fragment key="k13">
        <div>
          <Select
            labelId="select-area-of-interest-label"
            id="select-area-of-interest"
            value={iso3}
            onChange={(e) => handleIso3Change(e.target.value)}
            label="Area of Interest"
          >
            {props.countries.map((item) => (
              <MenuItem value={item.iso3} key={item.iso3}>
                {item.name_iso31}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div>
          <Select
            menuItemStyle={{ fontSize: "12px" }}
            labelStyle={{ fontSize: "12px" }}
            onChange={(e) => handleDomainChange(e.target.value)}
            value={domain}
            style={dropDownStyle}
            floatingLabelText="Domain"
            floatingLabelFixed={true}
            disabled={!domainEnabled}
          >
            {CONSTANTS.DOMAINS.map((item) => (
              <MenuItem
                style={{ fontSize: "12px" }}
                value={item}
                primaryText={item}
                key={item}
              />
            ))}
          </Select>
        </div>
        <div>
          <Select
            menuItemStyle={{ fontSize: "12px" }}
            labelStyle={{ fontSize: "12px" }}
            onChange={(e) => handleShapeChange(e.target.value)}
            value={shape}
            style={dropDownStyle}
            floatingLabelText="Planning unit shape"
            floatingLabelFixed={true}
          >
            {CONSTANTS.SHAPES.map((item) => (
              <MenuItem
                style={{ fontSize: "12px" }}
                value={item}
                primaryText={item}
                key={item}
              />
            ))}
          </Select>
        </div>
        <div>
          <Select
            menuItemStyle={{ fontSize: "12px" }}
            labelStyle={{ fontSize: "12px" }}
            onChange={(e) => handleAreaKm2Change(e.target.value)}
            value={areakm2}
            style={dropDownStyle}
            floatingLabelText="Area of each planning unit"
            floatingLabelFixed={true}
          >
            {CONSTANTS.AREAKM2S.map((item) => (
              <MenuItem
                style={{ fontSize: "12px" }}
                value={item}
                primaryText={`${item} Km2`}
                key={item}
              />
            ))}
          </Select>
        </div>
      </React.Fragment>
    </MarxanDialog>
  );
};

export default NewPlanningGridDialog;

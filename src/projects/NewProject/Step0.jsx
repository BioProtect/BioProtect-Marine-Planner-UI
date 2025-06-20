import CONSTANTS from "../../constants";
import React from "react";

const Step0 = ({
  changeCountry,
  iso3,
  dropDownStyle,
  countries,
  setDomain,
  domain,
  disabled,
}) => {
  const handleChangeCountry = () => changeCountry;
  return (
    <>
      <div>Choose a country and domain</div>
      <Select
        labelId="select-country-label"
        id="select-country"
        onChange={handleChangeCountry}
        value={iso3}
        style={dropDownStyle}
        label="Country"
      >
        {countries.map((item) => (
          <MenuItem value={item.iso3} key={item.iso3}>
            {item.name_iso31}
          </MenuItem>
        ))}
      </Select>
      <br />
      <Select
        onChange={(e) => setDomain(e.target.value)}
        value={domain}
        style={dropDownStyle}
        label="Domain"
        disabled={disabled}
      >
        {CONSTANTS.DOMAINS.map((item) => (
          <MenuItem value={item} key={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default Step0;

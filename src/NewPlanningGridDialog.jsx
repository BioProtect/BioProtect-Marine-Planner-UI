import React, { useState } from "react";

import BioprotectSelect from "./BPComponents/BioprotectSelect";
import CONSTANTS from "./constants";
import MarxanDialog from "./MarxanDialog";

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
    )[0];

    if (filteredCountry.has_marine) {
      setDomainEnabled(true);
    } else {
      handleDomainChange(1); // Assuming '1' corresponds to terrestrial
      setDomainEnabled(false);
    }
  };

  const handleDomainChange = (value) => setDomain(value);
  const handleShapeChange = (value) => setShape(value);
  const handleAreaKm2Change = (value) => setAreaKm2(value);

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

  return (
    <MarxanDialog
      open={props.open}
      fullWidth={true}
      maxWidth="sm"
      loading={props.loading}
      onOk={handleOk}
      onClose={props.onCancel}
      onCancel={props.onCancel}
      okDisabled={!iso3 || !domain || !areakm2 || props.loading}
      cancelLabel="Cancel"
      showCancelButton={true}
      helpLink="user.html#creating-new-planning-grids-using-marxan-web"
      title="New planning grid"
    >
      <p>{domainEnabled}</p>
      <React.Fragment key="k13">
        <BioprotectSelect
          id="area of interest"
          label="Area of Interest"
          options={props.countries}
          changeFunc={handleIso3Change}
          displayField="name_iso31"
          value={iso3}
        />
        <BioprotectSelect
          id="select domain"
          label="Domain"
          options={CONSTANTS.DOMAINS}
          changeFunc={handleDomainChange}
          disabled={!domainEnabled}
          value={domain}
        />
        <BioprotectSelect
          id="planning-unit"
          label="Planning Unit Shape"
          options={CONSTANTS.SHAPES}
          changeFunc={handleShapeChange}
          value={shape}
        />
        <BioprotectSelect
          id="planning-area"
          label="Area of each planning unit"
          options={CONSTANTS.AREAKM2S}
          changeFunc={handleAreaKm2Change}
          value={areakm2}
        />
      </React.Fragment>
    </MarxanDialog>
  );
};

export default NewPlanningGridDialog;

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectSelect from "../BPComponents/BioprotectSelect";
import CONSTANTS from "../constants";
import MarxanDialog from "../MarxanDialog";
import {
  toggleDialog,
} from "@slices/uiSlice";
import { togglePUD } from "@slices/planningUnitSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";

const NewPlanningGridDialog = ({
  loading,
  createNewPlanningUnitGrid,
  countries,
}) => {
  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit)

  const [iso3, setIso3] = useState("");
  const [domain, setDomain] = useState("");
  const [shape, setShape] = useState("");
  const [areakm2, setAreaKm2] = useState(undefined);
  const [domainEnabled, setDomainEnabled] = useState(true);
  const { showMessage } = useAppSnackbar();

  const handleIso3Change = (value) => {
    if (["FJI", "KIR", "NZL", "RUS", "TUV", "USA", "WLF"].includes(value)) {
      setIso3(undefined);
      // Optionally show an error if the country spans the meridian
      showMessage(
        "Countries that span the meridian are currently not supported...",
        "error"
      );
    } else {
      setIso3(value);
    }

    // Automatically set domain to terrestrial only if no marine area exists
    const filteredCountry = countries.filter(
      (country) => country.iso3 === value
    )[0];

    if (filteredCountry.has_marine) {
      setDomainEnabled(true);
    } else {
      setDomain(1); // Assuming '1' corresponds to terrestrial
      setDomainEnabled(false);
    }
  };

  const handleOk = () => {
    createNewPlanningUnitGrid(iso3, domain, areakm2, shape)
      .then(() => {
        () => closeDialog(); // Close the dialog after success
      })
      .catch((error) => {
        console.error("Error creating planning grid:", error);
      });
  };

  const closeDialog = () =>
    dispatch(
      togglePUD({
        dialogName: "newPlanningGridDialogOpen",
        isOpen: false,
      })
    );

  return (
    <MarxanDialog
      open={puState.dialogs.newPlanningGridDialogOpen}
      fullWidth={true}
      maxWidth="sm"
      loading={loading}
      onOk={handleOk}
      onClose={() => closeDialog()}
      onCancel={() => closeDialog()}
      okDisabled={!iso3 || !domain || !areakm2 || loading}
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
          options={countries}
          changeFunc={handleIso3Change}
          displayField="name_iso31"
          value={iso3}
        />
        <BioprotectSelect
          id="select domain"
          label="Domain"
          options={CONSTANTS.DOMAINS}
          changeFunc={setDomain}
          disabled={!domainEnabled}
          value={domain}
        />
        <BioprotectSelect
          id="planning-unit"
          label="Planning Unit Shape"
          options={CONSTANTS.SHAPES}
          changeFunc={setShape}
          value={shape}
        />
        <BioprotectSelect
          id="planning-area"
          label="Area of each planning unit"
          options={CONSTANTS.AREAKM2S}
          changeFunc={setAreaKm2}
          value={areakm2}
        />
      </React.Fragment>
    </MarxanDialog>
  );
};

export default NewPlanningGridDialog;

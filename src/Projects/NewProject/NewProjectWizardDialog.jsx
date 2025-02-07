import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CONSTANTS from "../../constants";
import MarxanDialog from "../../MarxanDialog";
import Step0 from "./Step0";
import Step1 from "./Step1";
import ToolbarButton from "../../ToolbarButton";
import { toggleProjDialog } from "../../slices/projectSlice";

const NewProjectWizardDialog = (props) => {
  const dispatch = useDispatch();
  const projState = useSelector((state) => state.project);

  const [domainEnabled, setDomainEnabled] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepComplete, setStepComplete] = useState(false);
  const [iso3, setIso3] = useState("");
  const [country, setCountry] = useState("");
  const [domain, setDomain] = useState("");
  const [shape, setShape] = useState("Hexagon");
  const [areakm2, setAreakm2] = useState(50);
  const [worldEcosystems, setWorldEcosystems] = useState(false);
  const [allSpecies, setAllSpecies] = useState(false);
  const [endemicSpecies, setEndemicSpecies] = useState(false);
  const [endangeredSpecies, setEndangeredSpecies] = useState(false);
  const [includeExistingPAs, setIncludeExistingPAs] = useState(false);
  const [iucnCategory, setIucnCategory] = useState("None");

  const steps = [
    "Country",
    "Planning units",
    "Habitats",
    "Species",
    "Existing PAs",
  ];

  // Function to return true if the inputs are complete
  const getComplete = () => {
    let complete = false;
    switch (stepIndex) {
      case 0:
        complete = Boolean(country && domain);
        break;
      case 1:
        complete = Boolean(shape && areakm2 > 0);
        break;
      default:
    }
    setStepComplete(complete);
  };

  useEffect(() => {
    getComplete();
  }, [stepIndex, country, domain, shape, areakm2]);

  const handleNext = () => {
    setStepIndex(stepIndex + 1);
  };

  const handlePrev = () => {
    setStepIndex(stepIndex - 1);
  };

  const changeCountry = (event) => {
    const value = event.target.value;
    if (!props.countries[value].has_marine) {
      setDomain(CONSTANTS.DOMAINS[1]);
      setDomainEnabled(false);
    } else {
      setDomainEnabled(true);
    }
    setIso3(props.countries[value].iso3);
    setCountry(props.countries[value].name_iso31);
    getComplete();
  };

  const createNewNationalProject = () => {
    props.createNewNationalProject({
      iso3,
      country,
      domain,
      shape,
      areakm2,
      worldEcosystems,
      allSpecies,
      endemicSpecies,
      endangeredSpecies,
      includeExistingPAs,
      iucnCategory,
    });
  };

  const closeDialog = () =>
    dispatch(
      toggleProjDialog({
        dialogName: "newProjectWizardDialogOpen",
        isOpen: false,
      })
    );

  const dropDownStyle = { width: "240px" };

  const actions = (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "auto",
        textAlign: "center",
      }}
    >
      <div style={{ margin: "0 16px" }}>
        <div style={{ marginTop: 12 }}>
          <ToolbarButton
            label="Back"
            disabled={stepIndex === 0}
            onClick={handlePrev}
          />
          <ToolbarButton
            label={stepIndex === steps.length - 1 ? "Finish" : "Next"}
            onClick={
              stepIndex === steps.length - 1
                ? createNewNationalProject
                : handleNext
            }
            primary={true}
            disabled={!stepComplete}
          />
        </div>
      </div>
    </div>
  );

  return (
    <MarxanDialog
      open={projState.dialogs.newProjectWizardDialogOpen}
      title={"New national project"}
      contentWidth={600}
      showCancelButton={true}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      onClose={() => closeDialog()}
      actions={actions}
    >
      <div className="newNationalProjectContent">
        {stepIndex === 0 && (
          <Step0
            changeCountry={changeCountry}
            iso3={iso3}
            style={dropDownStyle}
            countries={props.countries}
            setDomain={setDomain}
            domain={domain}
            disabled={!domainEnabled}
          />
        )}

        {stepIndex === 1 && (
          <Step1
            setShape={setShape}
            shape={shape}
            style={dropDownStyle}
            setAreakm2={setAreakm2}
            areakm2={areakm2}
          />
        )}

        {/* Additional steps follow similar patterns */}
      </div>
    </MarxanDialog>
  );
};

export default NewProjectWizardDialog;

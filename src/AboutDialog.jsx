import { useDispatch, useSelector } from "react-redux";

import MarxanDialog from "./MarxanDialog";
import React from "react";
import Typography from "@mui/material/Typography";
import biopama_small from "./images/biopama_small.png";
import iucn from "./images/iucn.png";
import jrc_logo_color_small from "./images/jrc_logo_color_small.png";
import mapbox_small from "./images/mapbox_small.png";
import { toggleDialog } from "@slices/uiSlice";
import wcmc from "./images/wcmc.png";

const AboutDialog = ({ marxanClientReleaseVersion, wdpaAttribution }) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const closeDialog = () =>
    dispatch(toggleDialog({ dialogName: "aboutDialogOpen", isOpen: false }));
  return (
    <MarxanDialog
      open={dialogStates.aboutDialogOpen}
      onOk={() => closeDialog()}
      contentWidth={500}
      offsetY={80}
      title="About"
    >
      <Typography variant="h6" gutterBottom>
        Software development
      </Typography>
      <Typography variant="body1" gutterBottom>
        <p>
          The BioProtect project is built upon the Marxan Web framework,
          utilizing its robust foundation to expand and improve its
          functionalities. The frontend has been completely rewritten and
          modernized, now powered by React 18 and MUI 5.
        </p>
        <p>
          Marxan Web ({marxanClientReleaseVersion}) initially developed by
          <a href="mailto:andrew.cottam@ec.europa.eu" className="email">
            Andrew Cottam
          </a>
          to whom much gratitude is owed.
        </p>
        <p>
          The initial project used Marxan 2.4.3 - Ian Ball, Matthew Watts &amp;
          Hugh Possingham
        </p>
      </Typography>
      <Typography variant="h6" gutterBottom>
        Data providers
      </Typography>
      <Typography variant="body1" gutterBottom>
        <p
          className="aboutText"
          style={{ marginTop: "10px" }}
          dangerouslySetInnerHTML={{ __html: wdpaAttribution }}
        ></p>
        <p className="aboutTitle">Funding and in-kind contributions</p>
        <p className="aboutText" style={{ marginTop: "10px" }}>
          Marxan Web funded by the BIOPAMA project of the European Commission.
          With in-kind contributions from Mapbox.
        </p>
        <p className="aboutText" style={{ marginTop: "10px" }}>
          Marxan funded by a range of donors - see
          <a
            href="http://marxan.org/credits.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
        <p className="logos">
          <a href="https://www.iucn.org/">
            <img
              src={iucn}
              alt="IUCN logo"
              title="IUCN logo"
              className="aboutLogo"
            />
          </a>
          <a href="https://www.unep-wcmc.org/">
            <img
              src={wcmc}
              alt="UN Environment WCMC logo"
              title="UN Environment WCMC logo"
              className="aboutLogo"
            />
          </a>
          <a href="https://www.biopama.org">
            <img
              src={biopama_small}
              alt="BIOPAMA logo"
              title="BIOPAMA logo"
              className="aboutLogo"
            />
          </a>
          <a href="https://ec.europa.eu/jrc/en">
            <img
              src={jrc_logo_color_small}
              alt="Joint Research Centre of the European Commission logo"
              title="Joint Research Centre of the European Commission logo"
              className="aboutLogo"
            />
          </a>
          <a href="https://www.mapbox.com">
            <img
              src={mapbox_small}
              alt="Mapbox logo"
              title="Mapbox logo"
              className="aboutLogo"
            />
          </a>
        </p>
      </Typography>
    </MarxanDialog>
  );
};

export default AboutDialog;

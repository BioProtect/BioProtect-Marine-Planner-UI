import { useDispatch, useSelector } from "react-redux";

import { Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import MarxanDialog from "./MarxanDialog";
import Typography from "@mui/material/Typography";
import coir_logo from "./images/COIR_Logo_transparent.png";
import ec_logo from "./images/ec_logo.svg";
import insight_logo from "./images/INSIGHT LOGO_colour.png";
import mi_logo from "./images/MI Logo.png";
import { toggleDialog } from "@slices/uiSlice";
import ug_logo from "./images/ug_logo.png";

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
      <Typography variant="h5" gutterBottom>
        Software development
      </Typography>
      <Typography variant="body1" gutterBottom>
        <p>
          The BioProtect Marine Planner is inspired by the Marxan Web project,
          initially developed by{" "}
          <a href="https://www.researchgate.net/profile/Andrew-Cottam">
            Andrew Cottam
          </a>{" "}
          to whom much gratitude is owed.
        </p>
        <p>
          The BioProtect Marine Planner is built using Tornado 6, React 18, MUI
          5, Martin Tile Server, and PostGIS 18.
        </p>
        <p>BioProtect Engage was built using React 18 and MUI 5</p>
        <p>The BioProtect grid is built using https://h3geo.org</p>
        <p>The conservation algorithm has been developed with Prioritizr</p>
      </Typography>
      <Divider />

      <Typography variant="h5" gutterBottom>
        Funding
      </Typography>
      <Typography variant="body1" gutterBottom>
        <p>This project is supported by the</p>
        <p>
          ‘CÓIR – ‘Changing Ocean IReland: Forecasting Biodiversity and
          Ecosystem Response’ Marine Institute Fellowship funded under the
          Marine Research Programme Ocean Ecosystems and Climate Call by the
          Irish Government.
        </p>
        <p>(Grant-Aid Agreement No. SPDOC/CC/20/001)</p>
      </Typography>
      <Divider />

      <div style={{ flexGrow: 1 }} sx={{ mt: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={6}>
            <a href="https://www.universityofgalway.ie/semru/research/current_projects/_c%C3%B3ir/">
              <img
                src={coir_logo}
                alt="CÓIR logo"
                title="CÓIR logo"
                style={{ width: "100%", height: 150, objectFit: "contain" }}
              />
            </a>
          </Grid>
          <Grid item xs={6}>
            <a href="https://www.marine.ie/site-area/research-funding/research-funding/marine-institute-research-and-innovation-call-2025">
              <img
                src={mi_logo}
                alt="Marine Institute logo"
                title="Marine Institute logo"
                style={{ width: "100%", height: 100, objectFit: "contain" }}
              />
            </a>
          </Grid>
          <Grid item xs={4}>
            <a href="https://www.universityofgalway.ie">
              <img
                src={ug_logo}
                alt="University of Galway logo"
                title="University of Galway logo"
                style={{ width: "100%", height: 60, objectFit: "contain" }}
              />
            </a>
          </Grid>
          <Grid item xs={4}>
            <a href="https://www.insight-centre.org">
              <img
                src={insight_logo}
                alt="Insight Centre"
                title="Insight Centre"
                style={{ width: "100%", height: 120, objectFit: "contain" }}
              />
            </a>
          </Grid>
          <Grid item xs={4}>
            <a href="https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-2020_en">
              <img
                src={ec_logo}
                alt="EC logo"
                title="EC logo"
                style={{ width: "100%", height: 60, objectFit: "contain" }}
              />
            </a>
          </Grid>
        </Grid>
      </div>
    </MarxanDialog>
  );
};

export default AboutDialog;

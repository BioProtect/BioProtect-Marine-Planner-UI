import React, { useCallback, useState } from "react";
import {
  faArrowAltCircleLeft as a,
  faArrowAltCircleRight as b,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faBookOpen,
  faFishFins,
  faFolderOpen,
  faGlobeEurope,
  faLayerGroup,
  faQuestionCircle,
  faShip,
  faStar,
  faThLarge,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import {
  setAddingRemovingFeatures,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import AppBar from "@mui/material/AppBar";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import Avatar from "@mui/material/Avatar";
import BioLogo from "../images/bioprotect_some_bkgrnd.png";
import Box from "@mui/material/Box";
import BuildIcon from "@mui/icons-material/Build";
import Button from "@mui/material/Button";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import HelpIcon from "@mui/icons-material/Help";
import SetMealIcon from "@mui/icons-material/SetMeal";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { selectCurrentUser } from "@slices/authSlice";
import { toggleDialog } from "@slices/uiSlice";

const MenuBar = ({
  open,
  openProjectsDialog,
  openPlanningGridsDialog,
  openCumulativeImpactDialog,
  openAtlasLayersDialog,
  setMenuAnchor,
}) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectState = useSelector((state) => state.project);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const userData = useSelector(selectCurrentUser);
  //opens the features dialog without the ability to add/remove features (i.e. different from the dialog that is opened from a project)

  const handleMenuOpen = (e, val) => {
    e.preventDefault();
    setMenuAnchor(e.currentTarget);
    dispatch(toggleDialog({ dialogName: val, isOpen: true }));
  };

  const openDialog = (e, val) => {
    dispatch(toggleDialog({ dialogName: val, isOpen: true }));
    dispatch(toggleDialog({ dialogName: "helpMenuOpen", isOpen: false }));
  };

  const togglePanel = (e, val) => {
    const valueToToggle =
      val === "infoPanelOpen"
        ? dialogStates.infoPanelOpen
        : dialogStates.resultsPanelOpen;

    dispatch(
      toggleDialog({
        dialogName: val,
        isOpen: !valueToToggle,
      }),
    );
  };

  const handleOpenFeaturesDialog = () => {
    dispatch(setAddingRemovingFeatures(false));
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: true,
      }),
    );
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: open ? "block" : "none",
      }}
    >
      <AppBar position="static">
        <Toolbar
          sx={{
            color: "primary.contrastText",
            background: (theme) => theme.palette.brand.barGradient,
            maxHeight: "60px",
          }}
        >
          <Avatar alt="BioProtect Logo" src={BioLogo} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button onClick={() => openProjectsDialog()} sx={{ color: "#fff" }}>
              <FolderOpenIcon title="Projects" />
              Projects
            </Button>

            <Button
              onClick={() => handleOpenFeaturesDialog()}
              sx={{ color: "#fff" }}
            >
              <SetMealIcon title="Features" />
              Features
            </Button>

            <Button
              onClick={() => openPlanningGridsDialog()}
              sx={{ color: "#fff" }}
            >
              <DirectionsBoatIcon title="Planning Grids" />
              Planning Grids
            </Button>
            {/* <AppBarIcon
              icon={faGlobeEurope}
              onClick={() => openAtlasLayersDialog()}
              title="Atlas Layers"
            /> */}
            <Button
              onClick={() => openCumulativeImpactDialog()}
              sx={{ color: "#fff" }}
            >
              <DirectionsBoatIcon title="Costs" />
              Activities & Costs
            </Button>

            <Button
              onClick={(e) => togglePanel(e, "infoPanelOpen")}
              sx={{ color: "#fff" }}
            >
              <ArrowCircleLeftIcon title="Left Panel" />
            </Button>

            <Button
              onClick={(e) => togglePanel(e, "resultsPanelOpen")}
              sx={{ color: "#fff" }}
            >
              <ArrowCircleRightIcon title="Results Panel" />
            </Button>

            <Button
              onClick={(e) => handleMenuOpen(e, "toolsMenuOpen")}
              sx={{ color: "#fff" }}
            >
              <BuildIcon title="Tools" />
            </Button>

            <Button
              onClick={(e) => handleMenuOpen(e, "helpMenuOpen")}
              sx={{ color: "#fff" }}
            >
              <HelpIcon title="Help" />
            </Button>
          </Typography>
          <Button
            color="inherit"
            className={"marxanServer"}
            title={"Click to open the Server Details window"}
            onClick={(e) => openDialog(e, "serverDetailsDialogOpen")}
          >
            {projectState.bpServer.name}
          </Button>
          <Button
            color="inherit"
            className={"username"}
            title={"Click to open the User menu"}
            onClick={(e) => handleMenuOpen(e, "userMenuOpen")}
          >
            {userData?.username}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default MenuBar;

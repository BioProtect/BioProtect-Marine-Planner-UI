import React, { useEffect, useMemo, useRef, useState } from "react";
import { faLock, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { setActiveTab, toggleDialog } from "../slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import CONSTANTS from "../constants";
import FeaturesTab from "./FeaturesTab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Paper from "@mui/material/Paper";
import PlanningUnitsTab from "./PlanningUnitsTab";
import ProjectTabContent from "./ProjectTab";
import Settings from "@mui/icons-material/Settings";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { selectUserData } from "../slices/authSlice";

const activeTabArr = ["project", "features", "planning_units"];

const InfoPanel = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const projState = useSelector((state) => state.project);
  const puState = useSelector((state) => state.planningUnit)
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const userData = useSelector(selectUserData);

  const [editingProjectName, setEditingProjectName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const [showPlanningGrid, setShowPlanningGrid] = useState(true);
  const [showProtectedAreas, setShowProtectedAreas] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [showStatuses, setShowStatuses] = useState(true);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const projectNameRef = useRef(null);
  const descriptionEditRef = useRef(null);

  useEffect(() => {
    if (editingProjectName && projectNameRef.current) {
      projectNameRef.current.value = projState.project;
      projectNameRef.current.focus();
    }

    if (editingDescription && descriptionEditRef.current) {
      descriptionEditRef.current.value = props.metadata.DESCRIPTION;
      descriptionEditRef.current.focus();
    }
  }, [
    editingProjectName,
    editingDescription,
    projState.project,
    props.metadata.DESCRIPTION,
  ]);

  useEffect(() => {
    if (uiState.activeTab) {
      setCurrentTabIndex(activeTabArr.indexOf(uiState.activeTab));
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.nativeEvent.keyCode === 13 || e.nativeEvent.keyCode === 27) {
      e.target.blur(); // call the onBlur event which will call the REST service to rename the project
    }
  };

  const handleBlur = (e) => {
    if (e.target.id === "projectName") {
      props.renameProject(e.target.value).then(() => {
        setEditingProjectName(false);
      });
    } else {
      props.renameDescription(e.target.value).then(() => {
        setEditingDescription(false);
      });
    }
  };

  const startEditingProjectName = () => {
    if (projState.project) {
      setEditingProjectName(true);
    }
  };

  const startEditingDescription = () => {
    if (projState.project && userData.role !== "ReadOnly") {
      setEditingDescription(true);
    }
  };

  const titleStyle = useMemo(
    () => ({
      position: "absolute",
      left: "39px",
      top: "32px",
      width: "365px",
      border: "1px lightgray solid",
    }),
    []
  );
  const panelStyle = useMemo(
    () => ({
      top: "60px",
      width: "300px",
      height: "400px",
    }),
    []
  );
  const iconStyle = useMemo(
    () => ({
      color: "white",
      height: "16px",
      marginTop: "4px",
      marginBottom: "2px",
      marginRight: "5px",
    }),
    []
  );

  const handleChange = (e) => {
    return e.target.id === "projectName"
      ? props.renameProject(e.target.value)
      : props.renameDescription(e.target.value);
  };

  const startStopPuEditSession = () =>
    puState.puEditing ? stopPuEditSession() : startPuEditSession();

  const startPuEditSession = () => {
    setShowPlanningGrid(true);
    props.startPuEditSession();
  };

  const stopPuEditSession = () => {
    setShowPlanningGrid(false);
    props.stopPuEditSession();
  };

  const changeIucnCategory = (event) => {
    props.changeIucnCategory(CONSTANTS.IUCN_CATEGORIES[event.target.value]);
  };
  const changeCostname = (event) => {
    const costname = event.target.value;
    if (costname === "Custom..") {
      // dispatch(toggleDialog({ dialogName: "costsDialogOpen", isOpen: true }));

      props.openCostsDialog();
    } else {
      props.changeCostname(costname).then(() => {
        props.loadCostsLayer(true);
      });
    }
  };

  const toggleProjectPrivacy = (evt, isInputChecked) => {
    const checkedString = isInputChecked ? "True" : "False";
    props.toggleProjectPrivacy(checkedString);
  };

  const stopProcess = () => props.stopProcess(props.pid);

  const togglePlanningUnits = (event, isInputChecked) => {
    setShowPlanningGrid(!showPlanningGrid);
    props.togglePULayer(isInputChecked);
  };

  const toggleProtectedAreas = (event, isInputChecked) => {
    setShowProtectedAreas(!showProtectedAreas);
    props.togglePALayer(isInputChecked);
  };

  const toggleCosts = (event, isInputChecked) => {
    setShowCosts(!showCosts);
    props.toggleCostsLayer(isInputChecked);
  };

  const toggleStatuses = (event, isInputChecked) => {
    setShowStatuses(!showStatuses);
    props.toggleStatuses(isInputChecked);
  };

  const handleTabChange = (evt, tabIndex) => {
    setCurrentTabIndex(tabIndex);
    if (tabIndex === 0) {
      dispatch(setActiveTab("project"));
    }
    if (tabIndex === 1) {
      dispatch(setActiveTab("features"));
      props.setPUTabInactive();
    }
    if (tabIndex === 2) {
      props.setPUTabActive();
    }
  };

  let costnames = props.costnames ? [...props.costnames, "Custom.."] : [];
  const displayStyle = {
    display: dialogStates.infoPanelOpen ? "block" : "none",
  };
  const combinedDisplayStyles = { ...panelStyle, ...displayStyle };
  const titleDisplayStyle = { display: editingProjectName ? "block" : "none" };
  const combinedDisplayStyle = { ...titleStyle, ...titleDisplayStyle };
  return (
    <React.Fragment>
      <div className={"infoPanel"} style={combinedDisplayStyles}>
        <Paper elevation={2} className="InfoPanelPaper" mb={4}>
          <Paper elevation={2} className="titleBar">
            {userData.role === "ReadOnly" ? (
              <span
                className={"projectNameEditBox"}
                title={projState.project + " (Read-only)"}
              >
                <FontAwesomeIcon style={iconStyle} icon={faLock} />
                {projState.project}
              </span>
            ) : (
              <span
                onClick={startEditingProjectName}
                className={"projectNameEditBox"}
                title="Click to rename the project"
              >
                {projState.project}
              </span>
            )}
            {userData.role === "ReadOnly" ? null : (
              <input
                id="projectName"
                ref={projectNameRef}
                style={combinedDisplayStyle}
                className={"projectNameEditBox"}
                onKeyDown={handleKeyPress}
                onBlur={handleBlur}
              />
            )}
          </Paper>

          <Tabs value={currentTabIndex} onChange={handleTabChange} centered>
            <Tab
              label="Project"
              value={0}
              disabled={!!puState.puEditing}
            />
            <Tab
              label="Features"
              value={1}
              disabled={!!puState.puEditing}
            />
            <Tab label="Planning units" value={2} />
          </Tabs>
          {currentTabIndex === 0 && (
            <ProjectTabContent
              toggleProjectPrivacy={toggleProjectPrivacy}
              metadata={props.metadata}
              owner={props.owner}
              updateDetails={handleChange}
            />
          )}
          {currentTabIndex === 1 && (
            <FeaturesTab
              openFeatureMenu={props.openFeatureMenu}
              openFeaturesDialog={props.openFeaturesDialog}
              metadata={props.metadata}
              updateFeature={props.updateFeature}
              leftmargin={"10px"}
              maxheight={"409px"}
              simple={false}
              showTargetButton={true}
              toggleFeatureLayer={props.toggleFeatureLayer}
              toggleFeaturePUIDLayer={props.toggleFeaturePUIDLayer}
              selectedFeatures={props.selectedFeatures}
              trigger={props.trigger}
              stopProcess={props.stopProcess}
              processId={props.processId}
            />
          )}
          {currentTabIndex === 2 && (
            <PlanningUnitsTab
              metadata={props.metadata}
              userRole={userData.role}
              startStopPuEditSession={startStopPuEditSession}
              clearManualEdits={props.clearManualEdits}
              preprocessing={props.preprocessing}
              changeIucnCategory={changeIucnCategory}
              costname={props.costname}
              costnames={costnames}
              changeCostname={changeCostname}
            />
          )}
          <Paper>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              pb={2}
              pt={2}
            >
              {projState.bpServer.type === "remote" ? (
                <Button
                  variant="contained"
                  startIcon={<FontAwesomeIcon icon={faShareAlt} />}
                  title={"Get a shareable link to this project"}
                  onClick={props.getShareableLink}
                  key="shareableLinkButton"
                >
                  Share
                </Button>
              ) : null}

              <Button
                variant="contained"
                startIcon={
                  <Settings style={{ height: "20px", width: "20px" }} />
                }
                title="Run Settings"
                onClick={() =>
                  dispatch(
                    toggleDialog({
                      dialogName: "settingsDialogOpen",
                      isOpen: true,
                    })
                  )
                }
                key="openSettingsButton"
              >
                Settings
              </Button>

              {userData.role !== "ReadOnly" ? (
                <>
                  <Button
                    variant="contained"
                    label="Stop"
                    title="Click to stop the current run"
                    onClick={() => stopProcess()}
                    disabled={props.pid === 0}
                    secondary="true"
                    key="stopRunButton"
                  >
                    Stop
                  </Button>
                  <Button
                    variant="contained"
                    label="Run"
                    title="Click to run this project"
                    onClick={props.runMarxan}
                    disabled={
                      props.preprocessing ||
                      projState.projectFeatures.length === 0 ||
                      puState.puEditing
                    }
                    secondary="true"
                    key="runButton"
                  >
                    Run
                  </Button>
                </>
              ) : null}
            </Stack>
          </Paper>
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default InfoPanel;

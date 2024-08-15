/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useEffect, useRef, useState } from "react";
import {
  faEraser,
  faLock,
  faSave,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";

import Button from "@mui/material/Button";
import CONSTANTS from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Paper from "@mui/material/Paper";
import PlanningUnitsTab from "./PlanningUnitsTab";
import ProjectTabContent from "./ProjectTab";
import SelectFeatures from "../SelectFeatures";
import Settings from "@mui/icons-material/Settings";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

const activeTabArr = ["project", "features", "planning_units"];

const InfoPanel = (props) => {
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [showPlanningGrid, setShowPlanningGrid] = useState(true);
  const [showProtectedAreas, setShowProtectedAreas] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [showStatuses, setShowStatuses] = useState(true);
  const [currentTabIndex, setCurrentTabIndex] = useState(
    activeTabArr.indexOf(props.activeTab) || 0
  );

  const projectNameRef = useRef(null);
  const descriptionEditRef = useRef(null);

  useEffect(() => {
    if (editingProjectName && projectNameRef.current) {
      projectNameRef.current.value = props.project;
      projectNameRef.current.focus();
    }

    if (editingDescription && descriptionEditRef.current) {
      descriptionEditRef.current.value = props.metadata.DESCRIPTION;
      descriptionEditRef.current.focus();
    }
  }, [
    editingProjectName,
    editingDescription,
    props.project,
    props.metadata.DESCRIPTION,
  ]);

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
    if (props.project) {
      setEditingProjectName(true);
    }
  };

  const startEditingDescription = () => {
    if (props.project && props.userRole !== "ReadOnly") {
      setEditingDescription(true);
    }
  };

  const startStopPuEditSession = () =>
    props.puEditing ? stopPuEditSession() : startPuEditSession();

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
      props.project_tab_active;
    }
    if (tabIndex === 1) {
      props.features_tab_active;
    }
    if (tabIndex === 2) {
      props.pu_tab_active;
    }
  };

  let costnames = props.costnames ? [...props.costnames, "Custom.."] : [];

  return (
    <React.Fragment>
      <div
        className={"infoPanel"}
        style={{
          top: "60px",
          width: "300px",
          height: "400px",
          display: props.open ? "block" : "none",
        }}
      >
        <Paper elevation={2} className="InfoPanelPaper" mb={4}>
          <Paper elevation={2} className="titleBar">
            {props.userRole === "ReadOnly" ? (
              <span
                className={"projectNameEditBox"}
                title={props.project + " (Read-only)"}
              >
                <FontAwesomeIcon
                  style={{
                    color: "white",
                    height: "16px",
                    marginTop: "4px",
                    marginBottom: "2px",
                    marginRight: "5px",
                  }}
                  icon={faLock}
                />
                {props.project}
              </span>
            ) : (
              <span
                onClick={startEditingProjectName}
                className={"projectNameEditBox"}
                title="Click to rename the project"
              >
                {props.project}
              </span>
            )}
            {props.userRole === "ReadOnly" ? null : (
              <input
                id="projectName"
                ref={projectNameRef}
                style={{
                  position: "absolute",
                  display: editingProjectName ? "block" : "none",
                  left: "39px",
                  top: "32px",
                  width: "365px",
                  border: "1px lightgray solid",
                }}
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
              disabled={props.puEditing ? true : false}
            />
            <Tab
              label="Features"
              value={1}
              disabled={props.puEditing ? true : false}
            />
            <Tab label="Planning units" value={2} />
          </Tabs>
          {currentTabIndex === 0 && (
            <ProjectTabContent
              setEditingDescription={setEditingDescription}
              toggleProjectPrivacy={toggleProjectPrivacy}
              descriptionEditRef={descriptionEditRef}
              editingDescription={editingDescription}
              userRole={props.userRole}
              metadata={props.metadata}
              startEditingDescription={startEditingDescription}
              user={props.user}
              owner={props.owner}
              handleBlur={handleBlur}
              handleKeyPress={handleKeyPress}
            />
          )}
          {currentTabIndex === 1 && (
            <SelectFeatures
              features={props.features}
              openFeatureMenu={props.openFeatureMenu}
              openFeaturesDialog={props.openFeaturesDialog}
              metadata={props.metadata}
              updateFeature={props.updateFeature}
              leftmargin={"10px"}
              maxheight={"409px"}
              simple={false}
              showTargetButton={true}
              openTargetDialog={props.openTargetDialog}
              userRole={props.userRole}
              toggleFeatureLayer={props.toggleFeatureLayer}
              toggleFeaturePUIDLayer={props.toggleFeaturePUIDLayer}
              selectedFeatures={props.selectedFeatures}
              trigger={props.trigger}
              puEditing={props.puEditing}
              stopProcess={props.stopProcess}
              processId={props.processId}
            />
          )}
          {currentTabIndex === 2 && (
            <PlanningUnitsTab
              metadata={props.metadata}
              userRole={props.userRole}
              puEditing={props.puEditing}
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
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faShareAlt} />}
                title={"Get a shareable link to this project"}
                onClick={props.getShareableLink}
                show={props.marxanServer.type === "remote"}
              >
                Share
              </Button>
              <Button
                variant="contained"
                startIcon={
                  <Settings style={{ height: "20px", width: "20px" }} />
                }
                title="Run Settings"
                onClick={() => props.updateState({ settingsDialogOpen: true })}
              >
                Settings
              </Button>
              <Button
                variant="contained"
                label="Stop"
                title="Click to stop the current run"
                show={props.userRole !== "ReadOnly"}
                onClick={() => stopProcess()}
                disabled={props.pid === 0}
                secondary="true"
              >
                Stop
              </Button>
              <Button
                variant="contained"
                label="Run"
                title="Click to run this project"
                show={props.userRole !== "ReadOnly"}
                onClick={props.runMarxan}
                disabled={
                  props.preprocessing ||
                  props.features.length === 0 ||
                  props.puEditing
                }
                secondary="true"
              >
                Run
              </Button>
            </Stack>
          </Paper>
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default InfoPanel;

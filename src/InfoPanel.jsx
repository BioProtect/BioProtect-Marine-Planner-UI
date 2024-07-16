/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useEffect, useRef, useState } from "react";

import Button from "@mui/material/Button";
import CONSTANTS from "./constants";
import Checkbox from "@mui/material/Checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import SelectFeatures from "./SelectFeatures";
import Settings from "@mui/icons-material/Settings";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { faEraser } from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { faShareAlt } from "@fortawesome/free-solid-svg-icons";

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
    if (props.project) {
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

  const changeIucnCategory = (event) =>
    props.changeIucnCategory(CONSTANTS.IUCN_CATEGORIES[event.target.value]);

  const changeCostname = (event) => {
    const costname = costnames[event.target.value];
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
        style={{ top: "60px", display: props.open ? "block" : "none" }}
      >
        <Paper elevation={2} className="InfoPanelPaper">
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
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
              />
            )}
          </Paper>
          <Tabs
            value={currentTabIndex}
            onChange={handleTabChange}
            style={{ margin: "20px" }}
          >
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
            <div>
              <div className={"tabTitle"}>Description</div>
              {props.userRole === "ReadOnly" ? null : (
                <TextareaAutosize
                  minRows={5}
                  id="descriptionEdit"
                  ref={descriptionEditRef}
                  style={{ display: editingDescription ? "block" : "none" }}
                  className={"descriptionEditBox"}
                  onKeyPress={handleKeyPress}
                  onBlur={handleBlur}
                />
              )}
              {props.userRole === "ReadOnly" ? (
                <div
                  className={"description"}
                  title={props.metadata.DESCRIPTION}
                  dangerouslySetInnerHTML={{
                    __html: props.metadata.DESCRIPTION,
                  }}
                />
              ) : (
                <div
                  className={"description"}
                  onClick={startEditingDescription}
                  style={{ display: !editingDescription ? "block" : "none" }}
                  title="Click to edit"
                  dangerouslySetInnerHTML={{
                    __html: props.metadata.DESCRIPTION,
                  }}
                />
              )}
              <div className={"tabTitle tabTitleTopMargin"}>Created</div>
              <div className={"createDate"}>{props.metadata.CREATEDATE}</div>
              <div
                style={{
                  display: props.user !== props.owner ? "block" : "none",
                }}
              >
                <div className={"tabTitle tabTitleTopMargin"}>Created by</div>
                <div className={"createDate"}>{props.owner}</div>
              </div>
              <div className={"tabTitle tabTitleTopMargin"}>
                {props.metadata.OLDVERSION ? "Imported project" : ""}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "413px",
                  display: props.userRole === "ReadOnly" ? "none" : "block",
                }}
              >
                <Checkbox
                  label="Private"
                  style={{ fontSize: "12px" }}
                  checked={props.metadata.PRIVATE}
                  onChange={toggleProjectPrivacy}
                />
              </div>
            </div>
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
            <div>
              <div>
                <div className={"tabTitle tabTitleInlineBlock"}>
                  Planning Grid
                </div>
              </div>
              <div className={"description"}>{props.metadata.pu_alias}</div>
              <div>
                <div className={"tabTitle tabTitleTopMargin"}>Statuses</div>
              </div>
              <div
                style={{
                  display: props.userRole === "ReadOnly" ? "none" : "block",
                }}
              >
                <div className={"puManualEditContainer"}>
                  <FontAwesomeIcon
                    icon={props.puEditing ? faSave : faLock}
                    onClick={() => startStopPuEditSession()}
                    title={props.puEditing ? "Save" : "Manually edit"}
                    style={{
                      cursor: "pointer",
                      marginLeft: "3px",
                      marginRight: "10px",
                      color: "rgba(255, 64, 129, 0.7)",
                    }}
                  />
                  <div
                    style={{
                      display: props.puEditing ? "inline-block" : "none",
                    }}
                    className={"puManualEditClear"}
                  >
                    <FontAwesomeIcon
                      icon={faEraser}
                      onClick={() => clearManualEdits()}
                      title={"Clear all manual edits"}
                      style={{
                        cursor: "pointer",
                        color: "rgba(255, 64, 129, 0.7)",
                      }}
                    />
                  </div>
                  <div
                    className={"description"}
                    style={{
                      display: "inline-block",
                      fontSize: "12px",
                      paddingLeft: "7px",
                    }}
                  >
                    {props.puEditing
                      ? "Click on the map to change the status"
                      : "Manually edit"}
                  </div>
                </div>
              </div>
              <Select
                floatingLabelText={"Lock in protected areas"}
                floatingLabelFixed={true}
                underlineShow={false}
                disabled={props.preprocessing || props.userRole === "ReadOnly"}
                menuItemStyle={{ fontSize: "12px" }}
                labelStyle={{ fontSize: "12px" }}
                style={{ marginTop: "-14px", width: "180px" }}
                value={props.metadata.IUCN_CATEGORY}
                onChange={() => changeIucnCategory()}
              >
                {CONSTANTS.IUCN_CATEGORIES.map((item) => {
                  return (
                    <MenuItem
                      value={item}
                      key={item}
                      primaryText={item}
                      style={{ fontSize: "12px" }}
                    />
                  );
                })}
              </Select>
              <div>
                <div className={"tabTitle"}>Costs</div>
              </div>
              <Select
                floatingLabelText={"Use cost surface"}
                floatingLabelFixed={true}
                underlineShow={false}
                disabled={props.preprocessing || props.userRole === "ReadOnly"}
                menuItemStyle={{ fontSize: "12px" }}
                labelStyle={{ fontSize: "12px" }}
                style={{ marginTop: "-14px", width: "230px" }}
                value={props.costname}
                onChange={() => changeCostname()}
              >
                {props.costnames.map((item) => {
                  return (
                    <MenuItem
                      value={item}
                      key={item}
                      primaryText={item}
                      style={{ fontSize: "12px" }}
                    />
                  );
                })}
              </Select>
            </div>
          )}
          {/* <TabPanel value="project">
            <div>
              <div
                style={{
                  fontSize: "12px",
                  marginLeft: "8px",
                  marginTop: "5px",
                }}
              >
                IUCN Category
              </div>
              <Select
                labelId="iucnCategoryLabel"
                id="iucnCategorySelect"
                value={props.iucnCategory}
                onChange={changeIucnCategory}
                style={{
                  fontSize: "12px",
                  height: "30px",
                  marginLeft: "8px",
                  width: "190px",
                  marginTop: "2px",
                }}
              >
                {Object.keys(CONSTANTS.IUCN_CATEGORIES).map((key) => (
                  <MenuItem key={key} value={key} style={{ fontSize: "12px" }}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
              <div
                style={{
                  fontSize: "12px",
                  marginLeft: "8px",
                  marginTop: "8px",
                }}
              >
                Cost
              </div>
              <Select
                labelId="costLabel"
                id="costSelect"
                value={props.costname}
                onChange={changeCostname}
                style={{
                  fontSize: "12px",
                  height: "30px",
                  marginLeft: "8px",
                  width: "190px",
                  marginTop: "2px",
                }}
              >
                {costnames.map((costname, index) => (
                  <MenuItem
                    key={index}
                    value={index}
                    style={{ fontSize: "12px" }}
                  >
                    {costname}
                  </MenuItem>
                ))}
              </Select>
              <div style={{ marginTop: "10px" }}>
                <Button
                  title="Save project"
                  style={{ marginLeft: "5px" }}
                  onClick={props.saveProject}
                >
                  <FontAwesomeIcon icon={faSave} />
                </Button>
                <Button
                  title="Export project"
                  style={{ marginLeft: "5px" }}
                  onClick={props.exportProject}
                >
                  <FontAwesomeIcon icon={faShareAlt} />
                </Button>
                <Button
                  title="Erase solutions"
                  style={{ marginLeft: "5px" }}
                  onClick={props.eraseSolutions}
                >
                  <FontAwesomeIcon icon={faEraser} />
                </Button>
                <Button
                  title="Edit Planning Units"
                  disabled={props.featureLoading}
                  style={{
                    marginLeft: "5px",
                    marginTop: "5px",
                    backgroundColor: props.puEditing ? "#e8f0fe" : "unset",
                  }}
                  onClick={() => startStopPuEditSession()}
                >
                  <Settings />
                </Button>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="project">
            <div>
              <div className={"tabTitle"}>Layers</div>
              <Checkbox
                label="Planning Units"
                checked={showPlanningGrid}
                onChange={togglePlanningUnits}
                style={{ marginLeft: "8px", fontSize: "12px" }}
              />
              <Checkbox
                label="Protected Areas"
                checked={showProtectedAreas}
                onChange={toggleProtectedAreas}
                style={{ marginLeft: "8px", fontSize: "12px" }}
              />
              <Checkbox
                label="Costs"
                checked={showCosts}
                onChange={toggleCosts}
                style={{ marginLeft: "8px", fontSize: "12px" }}
              />
              <Checkbox
                label="Statuses"
                checked={showStatuses}
                onChange={toggleStatuses}
                style={{ marginLeft: "8px", fontSize: "12px" }}
              />
            </div>
          </TabPanel> */}
          <Paper className={"lowerToolbar"}>
            <Button
              icon={<FontAwesomeIcon icon={faShareAlt} />}
              title={"Get a shareable link to this project"}
              onClick={props.getShareableLink}
              show={props.marxanServer.type === "remote"}
            />
            <Button
              icon={<Settings style={{ height: "20px", width: "20px" }} />}
              title="Run Settings"
              onClick={() => props.updateState({ settingsDialogOpen: true })}
            />
            <div className="toolbarSpacer" />
            <Button
              label="Stop"
              title="Click to stop the current run"
              show={props.userRole !== "ReadOnly"}
              style={{ marginLeft: "194px" }}
              onClick={() => stopProcess()}
              disabled={props.pid === 0}
              secondary="true"
            />
            <Button
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
            />
          </Paper>
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default InfoPanel;

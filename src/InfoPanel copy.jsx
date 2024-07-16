import React, { useEffect, useRef, useState } from "react";
import {
  faEraser,
  faLock,
  faSave,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CONSTANTS from "./constants";
import Checkbox from "@mui/material/Checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Select from "@mui/material/Select";
import SelectFeatures from "./SelectFeatures";
import Settings from "@mui/icons-material/Settings";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextareaAutosize from "@mui/material/TextareaAutosize";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const InfoPanel = (props) => {
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [showPlanningGrid, setShowPlanningGrid] = useState(true);
  const [showProtectedAreas, setShowProtectedAreas] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [showStatuses, setShowStatuses] = useState(true);

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
      e.target.blur();
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

  const handleTabChange = (event, newValue) => {
    props.setActiveTab(newValue);
  };

  let costnames = props.costnames ? [...props.costnames, "Custom.."] : [];

  return (
    <React.Fragment>
      <div
        className="infoPanel"
        style={{ top: "60px", display: props.open ? "block" : "none" }}
      >
        <Paper elevation={2} className="InfoPanelPaper">
          <Paper elevation={2} className="titleBar">
            {props.userRole === "ReadOnly" ? (
              <span
                className="projectNameEditBox"
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
                className="projectNameEditBox"
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
                className="projectNameEditBox"
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
              />
            )}
          </Paper>
          <Tabs value={props.activeTab} onChange={handleTabChange}>
            <Tab
              label="Project"
              value={0}
              disabled={props.puEditing}
              {...a11yProps(0)}
            />
            <Tab
              label="Features"
              value={1}
              disabled={props.puEditing}
              {...a11yProps(1)}
            />
            <Tab label="Planning units" value={2} {...a11yProps(2)} />
            <Tab label="Options" value={3} {...a11yProps(3)} />
            <Tab label="Layers" value={4} {...a11yProps(4)} />
          </Tabs>
          <CustomTabPanel value={props.activeTab} index={0}>
            <div>
              <div className="tabTitle">Description</div>
              {props.userRole === "ReadOnly" ? null : (
                <TextareaAutosize
                  minRows={5}
                  id="descriptionEdit"
                  ref={descriptionEditRef}
                  style={{ display: editingDescription ? "block" : "none" }}
                  className="descriptionEditBox"
                  onKeyPress={handleKeyPress}
                  onBlur={handleBlur}
                />
              )}
              {props.userRole === "ReadOnly" ? (
                <div
                  className="description"
                  title={props.metadata.DESCRIPTION}
                  dangerouslySetInnerHTML={{
                    __html: props.metadata.DESCRIPTION,
                  }}
                />
              ) : (
                <div
                  className="description"
                  onClick={startEditingDescription}
                  style={{ display: !editingDescription ? "block" : "none" }}
                  title="Click to edit"
                  dangerouslySetInnerHTML={{
                    __html: props.metadata.DESCRIPTION,
                  }}
                />
              )}
              <div className="tabTitle tabTitleTopMargin">Created</div>
              <div className="createDate">{props.metadata.CREATEDATE}</div>
              <div
                style={{
                  display: props.user !== props.owner ? "block" : "none",
                }}
              >
                <div className="tabTitle tabTitleTopMargin">Created by</div>
                <div className="createDate">{props.owner}</div>
              </div>
              <div className="tabTitle tabTitleTopMargin">
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
          </CustomTabPanel>
          <CustomTabPanel value={props.activeTab} index={1}>
            <SelectFeatures {...props} />
          </CustomTabPanel>
          <CustomTabPanel value={props.activeTab} index={2}>
            <div style={{ height: "197px" }}>
              <div style={{ height: "30px", display: "flex" }}>
                <Button
                  style={{
                    fontSize: "11px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    marginRight: "7px",
                  }}
                  variant="contained"
                  color="primary"
                  disabled={!props.validPu}
                  onClick={startStopPuEditSession}
                >
                  {props.puEditing ? "End Edit Session" : "Edit"}
                </Button>
                <Button
                  style={{
                    fontSize: "11px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                  }}
                  variant="contained"
                  color="primary"
                  disabled={!props.validPu}
                  onClick={props.openPuDialog}
                >
                  Erase
                </Button>
              </div>
              <div className="editPuNotice">
                {props.validPu ? null : "No Planning Unit layer exists."}
              </div>
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={props.activeTab} index={3}>
            <div>
              <div className="tabTitle">Costs</div>
              <Select
                style={{
                  width: "150px",
                  fontSize: "12px",
                  paddingTop: "0px",
                  paddingBottom: "0px",
                }}
                value={props.metadata.COSTNAME}
                onChange={changeCostname}
                disabled={props.userRole === "ReadOnly"}
              >
                {costnames.map((costname, index) => (
                  <MenuItem key={index} value={costname}>
                    {costname}
                  </MenuItem>
                ))}
              </Select>
              <div className="tabTitle tabTitleTopMargin">Statuses</div>
              <Select
                style={{
                  width: "150px",
                  fontSize: "12px",
                  paddingTop: "0px",
                  paddingBottom: "0px",
                }}
                value={props.metadata.IUCNCATEGORY}
                onChange={changeIucnCategory}
                disabled={props.userRole === "ReadOnly"}
              >
                {CONSTANTS.IUCN_CATEGORY_KEYS.map((iucnCategory, index) => (
                  <MenuItem key={index} value={iucnCategory}>
                    {iucnCategory}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={props.activeTab} index={4}>
            <div style={{ height: "197px" }}>
              <div style={{ height: "30px" }}>
                <Checkbox
                  label="Planning Grid"
                  checked={showPlanningGrid}
                  onChange={togglePlanningUnits}
                  disabled={!props.validPu}
                />
              </div>
              <div style={{ height: "30px" }}>
                <Checkbox
                  label="Protected Areas"
                  checked={showProtectedAreas}
                  onChange={toggleProtectedAreas}
                />
              </div>
              <div style={{ height: "30px" }}>
                <Checkbox
                  label="Costs"
                  checked={showCosts}
                  onChange={toggleCosts}
                />
              </div>
              <div style={{ height: "30px" }}>
                <Checkbox
                  label="Statuses"
                  checked={showStatuses}
                  onChange={toggleStatuses}
                />
              </div>
            </div>
          </CustomTabPanel>
          <Paper elevation={2} className="bottomBar">
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ float: "right" }}
              onClick={props.saveProject}
            >
              <FontAwesomeIcon icon={faSave} />
              Save
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ float: "right", marginRight: "10px" }}
              onClick={props.shareProject}
            >
              <FontAwesomeIcon icon={faShareAlt} />
              Share
            </Button>
          </Paper>
        </Paper>
      </div>
    </React.Fragment>
  );
};

InfoPanel.propTypes = {
  project: PropTypes.string,
  metadata: PropTypes.object,
  owner: PropTypes.string,
  user: PropTypes.string,
  userRole: PropTypes.string,
  activeTab: PropTypes.number,
  validPu: PropTypes.bool,
  puEditing: PropTypes.bool,
  startPuEditSession: PropTypes.func,
  stopPuEditSession: PropTypes.func,
  renameProject: PropTypes.func,
  renameDescription: PropTypes.func,
  changeIucnCategory: PropTypes.func,
  changeCostname: PropTypes.func,
  toggleProjectPrivacy: PropTypes.func,
  stopProcess: PropTypes.func,
  togglePULayer: PropTypes.func,
  togglePALayer: PropTypes.func,
  toggleCostsLayer: PropTypes.func,
  toggleStatuses: PropTypes.func,
  setActiveTab: PropTypes.func,
  saveProject: PropTypes.func,
  shareProject: PropTypes.func,
  openCostsDialog: PropTypes.func,
  openPuDialog: PropTypes.func,
};

export default InfoPanel;

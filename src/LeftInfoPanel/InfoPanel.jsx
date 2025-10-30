import React, { useEffect, useMemo, useRef, useState } from "react";
import { faLock, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { setActiveTab, toggleDialog } from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import CONSTANTS from "../constants";
import FeaturesTab from "./FeaturesTab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "../Loading";
import Paper from "@mui/material/Paper";
import PlanningUnitsTab from "./PlanningUnitsTab";
import ProjectTabContent from "./ProjectTab";
import Settings from "@mui/icons-material/Settings";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { selectCurrentUser } from "@slices/authSlice";
import { setProjectCosts } from "../slices/projectSlice";

const activeTabArr = ["project", "features", "planning_units"];

const InfoPanel = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const projState = useSelector((state) => state.project);
  const puState = useSelector((state) => state.planningUnit)
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const userData = useSelector(selectCurrentUser);

  const [editingProjectName, setEditingProjectName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const [showProtectedAreas, setShowProtectedAreas] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [showStatuses, setShowStatuses] = useState(true);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const projectNameRef = useRef(null);
  const descriptionEditRef = useRef(null);

  useEffect(() => {
    if (editingProjectName && projectNameRef.current) {
      projectNameRef.current.value = projState.projectData.name;
      projectNameRef.current.focus();
    }

    if (editingDescription && descriptionEditRef.current) {
      descriptionEditRef.current.value = props.metadata.DESCRIPTION;
      descriptionEditRef.current.focus();
    }
  }, [
    editingProjectName,
    editingDescription,
    projState.projectData,
    props.metadata.DESCRIPTION,
  ]);

  useEffect(() => {
    if (uiState.activeTab) {
      setCurrentTabIndex(activeTabArr.indexOf(uiState.activeTab));
    }
  }, []);

  //preprocess synchronously, i.e. one after another
  const preprocessAllFeatures = async () => {
    // for (const feature of projState.projectFeatures) {
    //   if (!feature.preprocessed) {
    //     await preprocessFeature(feature);
    //   }
    // }
    await preprocessFeature(projState.projectFeatures[1]);
  };

  const preprocessFeature = async (feature) => {
    const project_id = projState.projectData.project.id;
    const pu_id = projState.projectData.project.planning_unit_id;
    const planning_grid_name = props.metadata;
    try {
      // Switch to the log tab
      setActiveTab("log");

      // Call the WebSocket
      const url = `preprocessFeature?project_id=${project_id}&feature_id=${feature.id}&planning_grid_id=${pu_id}&feature_class_name=${feature.feature_class_name}`

      const message = await props.handleWebSocket(url);

      // Update feature with new data
      updateFeature(feature, {
        preprocessed: true,
        pu_count: Number(message.pu_count),
        pu_area: Number(message.pu_area),
        occurs_in_planning_grid: Number(message.pu_count) > 0,
      });

      return message;
    } catch (error) {
      console.error("Error preprocessing feature:", error);
      throw error; // Re-throw the error to handle it further up the call stack if needed
    }
  };

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
    if (projState.projectData) {
      setEditingProjectName(true);
    }
  };

  const startEditingDescription = () => {
    if (projState.projectData) {
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
      height: "300px",
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
    console.log("e ", e);
    return e.target.id === "projectName"
      ? props.renameProject(e.target.value)
      : props.renameDescription(e.target.value);
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

  // const togglePlanningUnits = (event, isInputChecked) => {
  //   setShowPlanningGrid(!showPlanningGrid);
  //   props.togglePULayer(isInputChecked);
  // };

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

  let costnames = projState.projectCosts ? [...projState.projectCosts, "Custom.."] : [];
  const displayStyle = {
    display: dialogStates.infoPanelOpen ? "block" : "none",
  };
  const combinedDisplayStyles = { ...panelStyle, ...displayStyle };
  const titleDisplayStyle = { display: editingProjectName ? "block" : "none" };
  const combinedDisplayStyle = { ...titleStyle, ...titleDisplayStyle };


  return projState.projectData ? (
    <React.Fragment>
      <div className="infoPanel" style={combinedDisplayStyles}>
        <Paper elevation={2} className="InfoPanelPaper" mb={4}>

          <Paper elevation={2} className="titleBar">
            <span
              onClick={startEditingProjectName}
              className="projectNameEditBox"
              title="Click to rename the project"
            >
              {projState.projectData?.project?.name || "Untitled project"}
            </span>
            <input
              id="projectName"
              ref={projectNameRef}
              style={combinedDisplayStyle}
              className="projectNameEditBox"
              onKeyDown={handleKeyPress}
              onBlur={handleBlur}
            />
          </Paper>

          <Tabs value={currentTabIndex} onChange={handleTabChange} centered>
            <Tab label="Project" value={0} disabled={!!puState.puEditing} />
            <Tab label="Features" value={1} disabled={!!puState.puEditing} />
            <Tab label="Planning units" value={2} />
          </Tabs>

          {currentTabIndex === 0 && (
            <ProjectTabContent
              toggleProjectPrivacy={toggleProjectPrivacy}
              updateDetails={handleChange}
            />
          )}
          {currentTabIndex === 1 && (
            <FeaturesTab
              {...props}
              leftmargin="10px"
              maxheight="409px"
              simple={false}
              showTargetButton
              preprocessAllFeatures={preprocessAllFeatures}
              preprocessFeature={preprocessFeature}
            />
          )}
          {currentTabIndex === 2 && (
            <PlanningUnitsTab
              {...props}
              userRole={userData?.role}
            />
          )}

          <Paper>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" pb={2} pt={2}>
              {projState.bpServer.type === "remote" && (
                <Button
                  variant="contained"
                  startIcon={<FontAwesomeIcon icon={faShareAlt} />}
                  title="Get a shareable link to this project"
                  onClick={props.getShareableLink}
                  key="shareableLinkButton"
                >
                  Share
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<Settings style={{ height: "20px", width: "20px" }} />}
                title="Run Settings"
                onClick={() => dispatch(toggleDialog({ dialogName: "settingsDialogOpen", isOpen: true }))}
                key="openSettingsButton"
              >
                Settings
              </Button>

              <>
                <Button
                  variant="contained"
                  title="Click to stop the current run"
                  onClick={props.stopProcess}
                  disabled={props.pid === 0}
                  key="stopRunButton"
                >
                  Stop
                </Button>
                <Button
                  variant="contained"
                  title="Click to run this project"
                  onClick={props.runMarxan}
                  disabled={props.preprocessing || projState.projectFeatures.length === 0 || puState.puEditing}
                  key="runButton"
                >
                  Run
                </Button>
              </>
              )
            </Stack>
          </Paper>
        </Paper>
      </div>
    </React.Fragment>
  ) : (
    <Loading />
  );

};

export default InfoPanel;

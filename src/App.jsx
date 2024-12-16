import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { CONSTANTS, INITIAL_VARS } from "./bpVars";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  addLocalServer,
  filterAndSortServers,
  getServerCapabilities,
} from "./Server/serverFunctions";
// SERVICES
import { getPaintProperty, getTypeProperty } from "./Features/featuresService";
import {
  initialiseServers,
  selectServer,
  setBpServer,
  setBpServers,
} from "./slices/projectSlice";
import {
  setActiveTab,
  setSnackbarMessage,
  setSnackbarOpen,
  toggleDialog,
  toggleFeatureDialog,
  togglePlanningGridDialog,
  toggleProjectDialog,
} from "./slices/uiSlice";
import { strToBool, zoomToBounds } from "./Helpers";
import { useDispatch, useSelector } from "react-redux";

import AboutDialog from "./AboutDialog";
import AddToMap from "@mui/icons-material/Visibility";
import AlertDialog from "./AlertDialog";
import AtlasLayersDialog from "./AtlasLayersDialog";
import ClassificationDialog from "./ClassificationDialog";
import ClumpingDialog from "./ClumpingDialog";
import CostsDialog from "./CostsDialog";
import CumulativeImpactDialog from "./Impacts/CumulativeImpactDialog";
import FeatureDialog from "./Features/FeatureDialog";
import FeatureInfoDialog from "./Features/FeatureInfoDialog";
import FeaturesDialog from "./Features/FeaturesDialog";
import GapAnalysisDialog from "./GapAnalysisDialog";
import HelpMenu from "./HelpMenu";
import HomeButton from "./HomeButton";
import HumanActivitiesDialog from "./Impacts/HumanActivitiesDialog";
import IdentifyPopup from "./IdentifyPopup";
import ImportCostsDialog from "./ImportComponents/ImportCostsDialog";
import ImportFeaturesDialog from "./Features/ImportFeaturesDialog";
import ImportFromWebDialog from "./ImportComponents/ImportFromWebDialog";
import ImportPlanningGridDialog from "./ImportComponents/ImportPlanningGridDialog";
import InfoPanel from "./LeftInfoPanel/InfoPanel";
import Loading from "./Loading";
import LoginDialog from "./LoginDialog";
//mapbox imports
import { Map } from "mapbox-gl"; // Assuming you're using mapbox-gl
import MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
import Menu from "@mui/material/Menu";
//project components
import MenuBar from "./MenuBar/MenuBar";
import MenuItemWithButton from "./MenuItemWithButton";
import NewFeatureDialog from "./Features/NewFeatureDialog";
import NewMarinePlanningGridDialog from "./Impacts/NewMarinePlanningGridDialog";
import NewPlanningGridDialog from "./NewPlanningGridDialog";
import NewProjectDialog from "./Projects/NewProject/NewProjectDialog";
import NewProjectWizardDialog from "./Projects/NewProject/NewProjectWizardDialog";
import PlanningGridDialog from "./PlanningGrids/PlanningGridDialog";
import PlanningGridsDialog from "./PlanningGrids/PlanningGridsDialog";
//@mui/material components and icons
import Popover from "@mui/material/Popover";
import Preprocess from "@mui/icons-material/Autorenew";
import ProfileDialog from "./User/ProfileDialog";
import ProjectsDialog from "./Projects/ProjectsDialog";
import ProjectsListDialog from "./Projects/ProjectsListDialog";
import Properties from "@mui/icons-material/ErrorOutline";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
/*global fetch*/
/*global URLSearchParams*/
/*global AbortController*/
import RegisterDialog from "./RegisterDialog";
import RemoveFromMap from "@mui/icons-material/VisibilityOff";
import RemoveFromProject from "@mui/icons-material/Remove";
import ResendPasswordDialog from "./ResendPasswordDialog";
import ResetDialog from "./ResetDialog";
import ResultsPanel from "./RightInfoPanel/ResultsPanel";
import RunCumuluativeImpactDialog from "./Impacts/RunCumuluativeImpactDialog";
import RunLogDialog from "./RunLogDialog";
import RunSettingsDialog from "./RunSettingsDialog";
import ServerDetailsDialog from "./User/ServerDetails/ServerDetailsDialog";
import ShareableLinkDialog from "./ShareableLinkDialog";
import Snackbar from "@mui/material/Snackbar";
import TargetDialog from "./TargetDialog";
/*eslint-enable no-unused-vars*/
// import { ThemeProvider } from "@mui/material/styles";
import ToolsMenu from "./ToolsMenu";
import UpdateWDPADialog from "./UpdateWDPADialog";
import UserMenu from "./User/UserMenu";
import UserSettingsDialog from "./User/UserSettingsDialog";
import UsersDialog from "./User/UsersDialog";
import Welcome from "./Welcome";
import ZoomIn from "@mui/icons-material/ZoomIn";
import classyBrew from "classybrew";
import { dialogTitleClasses } from "@mui/material";
/*eslint-disable no-unused-vars*/
import jsonp from "jsonp-promise";
import mapboxgl from "mapbox-gl";
import packageJson from "../package.json";

//GLOBAL VARIABLES
let MARXAN_CLIENT_VERSION = packageJson.version;
let timers = []; //array of timers for seeing when asynchronous calls have finished
mapboxgl.accessToken =
  "pk.eyJ1IjoiY3JhaWNlcmphY2siLCJhIjoiY2syeXhoMjdjMDQ0NDNnbDk3aGZocWozYiJ9.T-XaC9hz24Gjjzpzu6RCzg";

const App = () => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );
  const planningGridDialogStates = useSelector(
    (state) => state.ui.planningGridDialogStates
  );
  const projectState = useSelector((state) => state.project);

  const [brew, setBrew] = useState(null);
  const [dataBreaks, setDataBreaks] = useState([]);
  const [wdpaVectorTileLayer, setWdpaVectorTileLayer] = useState("");
  const [newWDPAVersion, setNewWDPAVersion] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [mapboxDrawControls, setMapboxDrawControls] = useState(undefined);
  const [runMarxanResponse, setRunMarxanResponse] = useState({});
  const [costData, setCostData] = useState(null);
  const [featurePreprocessing, setFeaturePreprocessing] = useState(null);
  const [previousIucnCategory, setPreviousIucnCategory] = useState(null);
  const [planningCostsTrigger, setPlanningCostsTrigger] = useState(false);
  const [activities, setActivities] = useState([]);
  const [addToProject, setAddToProject] = useState(true);
  const [addingRemovingFeatures, setAddingRemovingFeatures] = useState(false);
  const [pid, setPid] = useState("");
  const [allFeatures, setAllFeatures] = useState([]);
  const [allImpacts, setAllImpacts] = useState([]);
  const [atlasLayers, setAtlasLayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [basemap, setBasemap] = useState("North Star");
  const [basemaps, setBasemaps] = useState([]);
  const [clumpingRunning, setClumpingRunning] = useState(false);
  const [costnames, setCostnames] = useState([]);
  const [costsLoading, setCostsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [currentFeature, setCurrentFeature] = useState({});
  const [featureDatasetFilename, setFeatureDatasetFilename] = useState("");
  const [featureMenuOpen, setFeatureMenuOpen] = useState(false);
  const [featureMetadata, setFeatureMetadata] = useState({});
  const [files, setFiles] = useState({});
  const [gapAnalysis, setGapAnalysis] = useState([]);
  const [identifyFeatures, setIdentifyFeatures] = useState([]);
  const [identifyPlanningUnits, setIdentifyPlanningUnits] = useState({});
  const [identifyProtectedAreas, setidentifyProtectedAreas] = useState([]);
  const [identifyVisible, setIdentifyVisible] = useState(false);
  /////////////////////////////////////////////////////////////////////////////
  const [logMessages, setLogMessages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mapPaintProperties, setMapPaintProperties] = useState({
    mapPP0: [],
    mapPP1: [],
    mapPP2: [],
    mapPP3: [],
    mapPP4: [],
  });
  const [mapCentre, setMapCentre] = useState({ lng: 0, lat: 0 });
  const [mapZoom, setMapZoom] = useState(12);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [owner, setOwner] = useState("");
  const [planningUnitGrids, setPlanningUnitGrids] = useState([]);
  const [planningUnits, setPlanningUnits] = useState([]);
  const [preprocessing, setPreprocessing] = useState(false);
  const [project, setProject] = useState("");
  const [projectFeatures, setProjectFeatures] = useState([]);
  const [user, setUser] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [projectListDialogHeading, setProjectListDialogHeading] = useState("");
  const [projectListDialogTitle, setProjectListDialogTitle] = useState("");
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [protectedAreaIntersections, setProtectedAreaIntersections] = useState(
    []
  );
  const [puEditing, setPuEditing] = useState(false);
  const [registry, setRegistry] = useState(undefined);
  const [renderer, setRenderer] = useState({});
  const [resultsPanelOpen, setResultsPanelOpen] = useState(false);
  const [runLogs, setRunLogs] = useState([]);
  const [runParams, setRunParams] = useState([]);
  const [runningImpactMessage, setRunningImpactMessage] =
    useState("Import Activity");
  const [selectedCosts, setSelectedCosts] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [selectedImpactIds, setSelectedImpactIds] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [shareableLink, setShareableLink] = useState(false);
  const [smallLinearGauge, setSmallLinearGauge] = useState(true);
  const [tileset, setTileset] = useState(null);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [unauthorisedMethods, setUnauthorisedMethods] = useState([]);
  const [uploadedActivities, setUploadedActivities] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState([]);
  const [wdpaAttribution, setWdpaAttribution] = useState("");
  const [password, setPassword] = useState("");
  const [popupPoint, setPopupPoint] = useState({ x: 0, y: 0 });
  const [userData, setUserData] = useState({
    SHOWWELCOMESCREEN: true,
    REPORTUNITS: "Ha",
  });
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const [resendEmail, setResendEmail] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [wdpaLayer, setWdpaLayer] = useState();
  const [resultsLayer, setResultsLayer] = useState({});
  const [summaryStats, setSummaryStats] = useState([]);
  const [projectImpacts, setProjectImpacts] = useState([]);
  const [paLayerVisible, setPaLayerVisible] = useState(false);
  const [planningGridMetadata, setPlanningGridMetadata] = useState({});
  const [runlogTimer, setRunlogTimer] = useState(0);

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    dispatch(initialiseServers(INITIAL_VARS.MARXAN_SERVERS))
      .unwrap()
      .then((message) => console.log(message))
      .catch((error) => console.error("Error:", error));
  }, [dispatch, INITIAL_VARS.MARXAN_SERVERS]);

  const selectServerByName = useCallback(
    (servername) => {
      // Remove the search part of the URL
      window.history.replaceState({}, document.title, "/");
      const server = projectState.bpServers.find(
        (item) => item.name === servername
      );
      if (server) {
        dispatch(selectServer(server));
      }
    },
    [dispatch, projectState.bpServers]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("project")) {
      setShareableLink(true);
      setLoggedIn(true);
    }

    const fetchGlobalVariables = async () => {
      try {
        initialiseServers(INITIAL_VARS.MARXAN_SERVERS);
        setBrew(new classyBrew());

        setBasemaps(INITIAL_VARS.MAPBOX_BASEMAPS);
        setRegistry(INITIAL_VARS);
        setInitialLoading(false);

        if (searchParams.has("project")) openShareableLink(searchParams);
        if (searchParams.has("server"))
          selectServerByName(searchParams.get("server"));
      } catch (error) {
        console.error("Error fetching global variables:", error);
      }
    };

    fetchGlobalVariables();
  }, []);

  useEffect(() => {
    if (planningCostsTrigger && projectLoaded && owner !== "" && user !== "") {
      (async () => {
        await getPlanningUnitsCostData();
        setPlanningCostsTrigger(false);
      })();
    }
  });

  const setSnackBar = (message, silent = false) => {
    if (!silent) {
      dispatch(setSnackbarOpen(true));
      dispatch(setSnackbarMessage(message));
    }
  };

  // Memoized function to check for timeout errors or empty responses
  const responseIsTimeoutOrEmpty = useCallback(
    (response, snackbarOpen = true) => {
      if (!response) {
        const msg = "No response received from server";
        if (snackbarOpen) {
          dispatch(setSnackbarMessage(msg));
        }
        return true;
      }
      return false;
    },
    []
  );
  // Memoized function to check if the response indicates a server error
  const isServerError = useCallback(
    (response, snackbarOpen = true) => {
      if (
        (response && response.error) ||
        (response &&
          response.hasOwnProperty("metadata") &&
          response.metadata.hasOwnProperty("error") &&
          response.metadata.error != null)
      ) {
        const err = response.error ? response.error : response.metadata.error;
        if (snackbarOpen) {
          setSnackBar(err);
        }
        return true;
      } else {
        // Handle warnings from server responses
        if (response && response.warning) {
          if (snackbarOpen) {
            setSnackBar(response.warning);
          }
        }
        return false;
      }
    },
    [setSnackBar]
  );

  // Memoized function to check for errors using responseIsTimeoutOrEmpty and isServerError
  const checkForErrors = useCallback(
    (response, snackbarOpen = true) => {
      const networkError = responseIsTimeoutOrEmpty(response, snackbarOpen);
      const serverError = isServerError(response, snackbarOpen);
      const isError = networkError || serverError;

      if (isError) {
        // Write the full trace to the console if available
        const error = response.hasOwnProperty("trace")
          ? response.trace
          : response.hasOwnProperty("error")
          ? response.error
          : "No error message returned";
        console.error("Error message from server: " + error);
      }
      return isError;
    },
    [responseIsTimeoutOrEmpty, isServerError]
  );

  const setWDPAVectorTilesLayerName = useCallback((wdpa_version) => {
    // Get the short version of the wdpa_version, e.g., August 2019 to aug_2019
    const version =
      wdpa_version.toLowerCase().substr(0, 3) + "_" + wdpa_version.substr(-4);
    setWdpaVectorTileLayer(`wdpa_${version}_polygons`);
  }, []);

  const switchToGuestUser = useCallback(async () => {
    // Set the state to switch to guest user
    setPassword("password");
    setUser("guets");
    return "Switched to guest user";
  }, []);

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // REQUEST HELPERS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  //makes a GET request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  const _get = useCallback(
    (params, timeout = CONSTANTS.TIMEOUT) => {
      setLoading(true);
      return new Promise((resolve, reject) => {
        jsonp(projectState.bpServer.endpoint + params, { timeout })
          .promise.then((response) => {
            setLoading(false);
            !checkForErrors(response)
              ? resolve(response)
              : reject(response.error);
          })
          .catch((err) => {
            setLoading(false);
            setSnackBar(
              `Request timeout - See <a href='${CONSTANTS.ERRORS_PAGE}#request-timeout' target='blank'>here</a>`
            );
            reject(err);
          });
      });
    },
    [checkForErrors, setSnackBar]
  );

  //makes a POST request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  const _post = useCallback(
    async (
      method,
      formData,
      timeout = CONSTANTS.TIMEOUT,
      withCredentials = CONSTANTS.SEND_CREDENTIALS
    ) => {
      setLoading(true);

      try {
        const controller = new AbortController();
        const { signal } = controller;
        // Set a timeout to abort the request if it takes too long
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(
          projectState.bpServer.endpoint + method,
          formData,
          {
            method: "POST",
            credentials: withCredentials,
            signal, // Pass the AbortSignal to the fetch call
          }
        );
        clearTimeout(timeoutId);
        const data = await response.json();

        if (!checkForErrors(data)) {
          return data;
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          if (err.message !== "Network Error") {
            setSnackBar(err.message);
          }
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectState.bpServer.endpoint, checkForErrors, setSnackBar]
  );

  // Memoized WebSocket function
  const _ws = useCallback(
    (params, msgCallback) => {
      return new Promise((resolve, reject) => {
        // Create a new WebSocket instance
        const ws = new WebSocket(
          projectState.bpServer.websocketEndpoint + params
        );

        // WebSocket event handlers
        ws.onMessage = (evt) => {
          const message = JSON.parse(evt.data);

          if (!checkForErrors(message)) {
            if (message.status === "Finished") {
              msgCallback(message);
              setPreprocessing(false);
              resolve(message);
            } else {
              msgCallback(message);
            }
          } else {
            msgCallback(message);
            setPreprocessing(false);
            reject(message.error);
          }
        };

        ws.onOpen = (evt) => {
          // Handle WebSocket open event if necessary
        };

        ws.onError = (evt) => {
          setPreprocessing(false);
          reject(evt);
        };

        ws.onClose = (evt) => {
          setPreprocessing(false);
          if (!evt.wasClean) {
            msgCallback({ status: "SocketClosedUnexpectedly" });
          } else {
            reject(evt);
          }
        };
      });
    },
    [projectState.bpServer.websocketEndpoint, checkForErrors]
  );

  //called when any websocket message is received - this logic removes duplicate messages
  const wsMessageCallback = async (message) => {
    //dont log any clumping projects
    if (message.user === "_clumping") return;
    //log the message
    logMessage(message);
    switch (message.status) {
      case "Started": //from the open method of all MarxanWebSocketHandler subclasses
        //set the processing state when the websocket starts
        setPreprocessing(true);
        break;
      case "pid": //from marxan runs and preprocessing - the pid is an identifer and the pid, e.g. m1234 is a marxan run process with a pid of 1234
        setPid(message.pid);
        break;
      case "FeatureCreated":
        //remove all preprocessing messages
        removeMessageFromLog("Preprocessing");
        await newFeatureCreated(message.id);
        break;
      case "Finished": //from the close method of all MarxanWebSocketHandler subclasses
        //reset the pid
        setPid(0);
        //remove all preprocessing messages
        removeMessageFromLog("Preprocessing");
        break;
      default:
        break;
    }
  };

  //logs the message if necessary - this removes duplicates
  const logMessage = useCallback((message) => {
    if (message.status === "SocketClosedUnexpectedly") {
      // Server closed WebSocket unexpectedly
      // Remove the "Preprocessing" messages
      // Reset the PID
      messageLogger({
        method: message.method,
        status: "Finished",
        error: "The WebSocket connection closed unexpectedly",
      });
      removeMessageFromLog("Preprocessing");
      setPid(0);
    } else {
      // Check if the message has a PID and handle accordingly
      if (message.hasOwnProperty("pid") && message.status !== "RunningMarxan") {
        const existingMessages = logMessages.filter(
          (_message) =>
            _message.hasOwnProperty("pid") && _message.pid === message.pid
        );

        if (existingMessages.length > 0) {
          // Compare with the latest status
          if (
            message.status !==
            existingMessages[existingMessages.length - 1].status
          ) {
            // Remove the processing message if status is "Finished"
            if (message.status === "Finished") {
              removeMessageFromLog("RunningQuery", message.pid);
            }
            messageLogger(message);
          }
        } else {
          // Log the first message for that PID
          messageLogger(message);
        }
      } else {
        // Remove duplicate messages from the log (unless they have specific statuses)
        if (
          !(
            message.status === "RunningMarxan" ||
            message.status === "Started" ||
            message.status === "Finished"
          )
        ) {
          removeMessageFromLog(message.status);
        }
        // Log the message
        messageLogger(message);
      }
    }
  }, []);

  // removes a message from the log by matching on pid and status or just status
  // update the messages state - filter previous messages state by pid and status
  const removeMessageFromLog = useCallback((status, pid) => {
    setLogMessages((prevState) => [
      prevState.logMessages.filter((message) => {
        return pid !== undefined
          ? !(message.pid === pid && message.status === status)
          : !(message.status === status);
      }),
    ]);
  }, []);

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // MANAGING SERVERS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  const startLogging = (clearLog = false) => {
    //switches the results pane to the log tab and clears log if needs be
    setActiveTab("log");
    if (clearLog) setLogMessages([]);
  };

  // Main logging method - all log messages use this method
  const messageLogger = useCallback((message) => {
    // Add a timestamp to the message
    const timestampedMessage = { ...message, timestamp: new Date() };
    // Update the state with the new log message
    setLogMessages((prevState) => [
      ...prevState.logMessages,
      timestampedMessage,
    ]);
  }, []);

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // MANAGING USERS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  const removeKeys = (obj, keys) => {
    // Create a shallow copy of the object to avoid mutating the original
    const newObj = { ...obj };
    // Iterate over the keys and delete each key from the new object
    keys.forEach((key) => {
      delete newObj[key];
    });
    return newObj;
  };

  //deletes all of the projects belonging to the passed user from the state
  const deleteProjectsForUser = (user) => {
    const updatedProjects = projects.filter((project) => project.user !== user);
    setProjects(updatedProjects);
  };

  const createNewUser = async (user, password, name, email) => {
    const formData = new FormData();
    formData.append("user", user);
    formData.append("password", password);
    formData.append("fullname", name);
    formData.append("email", email);

    try {
      const response = await _post("createUser", formData);
      // UI feedback
      setSnackBar(response.info);
      dispatch(
        toggleDialog({ dialogName: "registerDialogOpen", isOpen: false })
      );
      setPassword("");
      setUser(user);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const updateUser = async (parameters, user = user) => {
    try {
      // Remove keys that are not part of the user's information
      const filteredParameters = removeKeys(parameters, [
        "updated",
        "validEmail",
      ]);
      const formData = new FormData();
      formData.append("user", user);
      appendToFormData(formData, filteredParameters);

      const response = await _post("updateUserParameters", formData);
      // If successful, update the state if the current user is being updated
      if (user === user) {
        // Update local user data
        const newUserData = { ...userData, ...filteredParameters };
        // Update state
        setUserData(newUserData);
      }
      return newUserData; // Optionally return response if needed elsewhere
    } catch (error) {
      console.error("Error updating user:", error);
      throw error; // Optional: rethrow error if you want to handle it further up the call stack
    }
  };

  const deleteUser = async (user) => {
    try {
      // Send request to delete the user
      await _get(`deleteUser?user=${user}`);
      setSnackBar("User deleted");

      // Update local state to remove the deleted user
      const usersCopy = users.filter((item) => item.user !== user);
      setUsers(usersCopy);

      // Check if the current project belongs to the deleted user
      if (owner === user) {
        setSnackBar(
          "Current project no longer exists. Loading next available."
        );

        // Load the next available project
        const nextProject = projects.find((project) => project.user !== user);
        if (nextProject) {
          // Import loadProject from the appropriate file if necessary
          await loadProject(nextProject.name, nextProject.user);
        }

        // Import deleteProjectsForUser from the appropriate file if necessary
        deleteProjectsForUser(user);
      }
    } catch (error) {
      // Handle errors
      console.error("Failed to delete user:", error);
      setSnackBar("Failed to delete user");
    }
  };

  const getUsers = async () => {
    try {
      const response = await _get("getUsers");
      setUsers(response.users);
    } catch (error) {
      setUsers([]);
    }
  };

  const handleCreateUser = async (user, password, name, email) =>
    await createNewUser(user, password, name, email);

  const handleUserUpdate = async (parameters, user = user) =>
    await updateUser(parameters, user);

  const handleDeleteUser = async (user) => await deleteUser(user);

  const checkPassword = async (user, password) =>
    await _get(`validateUser?user=${user}&password=${password}`, 1000);

  //the user is validated so login
  const login = async (user, password) => {
    try {
      const checkedPass = await checkPassword(user, password);
      if (checkedPass) {
        setLoggedIn(true);
        const userResp = await _get(`getUser?user=${user}`);
        setUser(user);
        setUserData(userResp.userData);
        setUnauthorisedMethods(userResp.unauthorisedMethods);
        setDismissedNotifications(userResp.dismissedNotifications || []);
        setResultsPanelOpen(true);
        dispatch(toggleDialog({ dialogName: "infoPanelOpen", isOpen: true }));

        const current_basemap = basemaps.find(
          (item) => item.name === userResp.userData.BASEMAP
        );
        userResp.userData.USEFEATURECOLORS = strToBool(
          userResp.userData.USEFEATURECOLORS
        );
        userResp.userData.SHOWWELCOMESCREEN = strToBool(
          userResp.userData.SHOWWELCOMESCREEN
        );
        userResp.userData.SHOWPOPUP = strToBool(userResp.userData.SHOWPOPUP);

        await loadBasemap(current_basemap);
        const speciesData = await _get("getAllSpeciesData");
        setAllFeatures(speciesData.data);

        await loadProject(
          userResp.userData.LASTPROJECT,
          user,
          userResp,
          speciesData.data
        );
        await getPlanningUnitGrids();
        return "Logged in";
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Handle error appropriately
      throw error;
    }
  };
  //log out and reset some state
  const logout = () => {
    dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));
    setBrew(new classyBrew());
    setPassword("");
    setRunParams([]);
    setResultsPanelOpen(false);
    setRenderer({});
    setUser("");
    setProjectFeatures([]);
    setProject("");
    setPlanningUnits([]);
    setOwner("");
    setNotifications([]);
    setMetadata({});
    setFiles({});
    resetResults();
    //clear the currently set cookies
    _get("logout").then((response) => {
      setLoggedIn(false);
      dispatch(toggleDialog({ dialogName: "infoPanelOpen", isOpen: false }));
    });
  };

  const resendPassword = async () => {
    try {
      const response = await _get(`resendPassword?user=${user}`);
      dispatch(setSnackbarMessage(response.info));
      // Close the resend password dialog
      dispatch(
        toggleDialog({ dialogName: "resendPasswordDialogOpen", isOpen: false })
      );
    } catch (error) {
      console.error("Failed to resend password:", error);
    }
  };

  const changeRole = async (user, role) => {
    await handleUserUpdate({ ROLE: role }, user);
    const updatedUsers = users.map((item) =>
      item.user === user ? { ...item, ROLE: role } : item
    );
    // Update the state with the modified user list
    setUsers(updatedUsers);
  };

  const toggleProjectPrivacy = async (newValue) => {
    await updateProjectParameter("PRIVATE", newValue);
    setMetadata((prevState) => ({
      ...prevState.metadata,
      PRIVATE: newValue === "True",
    }));
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // NOTIFICATIONS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //parse the notifications
  const parseNotifications = useCallback(() => {
    const newNotifications = [];

    //see if there are any new notifications from the marxan-registry
    if (registry.NOTIFICATIONS.length > 0) {
      addNotifications(registry.NOTIFICATIONS);
    }
    // Check for new version of wdpa data
    // From the Marxan Registry WDPA object - if there is then show a notification to admin users
    if (newWDPAVersion) {
      addNotifications([
        {
          id: "wdpa_update_" + registry.WDPA.latest_version,
          html: "A new version of the WDPA is available. Go to Help | Server Details for more information.",
          type: "Data Update",
          showForRoles: ["Admin"],
        },
      ]);
    }
    //see if there is a new version of the marxan-client software
    if (MARXAN_CLIENT_VERSION !== registry.CLIENT_VERSION) {
      addNotifications([
        {
          id: "marxan_client_update_" + registry.CLIENT_VERSION,
          html:
            "A new version of marxan-client is available (" +
            MARXAN_CLIENT_VERSION +
            "). Go to Help | About for more information.",
          type: "Software Update",
          showForRoles: ["Admin"],
        },
      ]);
    }
    //see if there is a new version of the marxan-server software
    if (projectState.bpServer.server_version !== registry.SERVER_VERSION) {
      addNotifications([
        {
          id: "marxan_server_update_" + registry.SERVER_VERSION,
          html:
            "A new version of marxan-server is available (" +
            registry.SERVER_VERSION +
            "). Go to Help | Server Details for more information.",
          type: "Software Update",
          showForRoles: ["Admin"],
        },
      ]);
    }
    //check that there is enough disk space
    if (projectState.bpServer.disk_space < 1000) {
      addNotifications([
        {
          id: "hardware_1000",
          html: "Disk space < 1Gb",
          type: "Hardware Issue",
          showForRoles: ["Admin"],
        },
      ]);
    } else if (projectState.bpServer.disk_space < 2000) {
      addNotifications([
        {
          id: "hardware_2000",
          html: "Disk space < 2Gb",
          type: "Hardware Issue",
          showForRoles: ["Admin"],
        },
      ]);
    } else if (projectState.bpServer.disk_space < 3000) {
      addNotifications([
        {
          id: "hardware_3000",
          html: "Disk space < 3Gb",
          type: "Hardware Issue",
          showForRoles: ["Admin"],
        },
      ]);
    }
  });

  const addNotifications = (newNotifications) => {
    const currentNotifications = [...notifications];
    // Process and filter notifications based on role, dismissal, and expiry
    const processedNotifications = newNotifications.map((item) => {
      const allowedForRole = item.showForRoles.includes(userData.ROLE);
      const notDismissed = !dismissedNotifications.includes(String(item.id));
      let notExpired = true;
      // Check if the notification has an expiry date and if it is still valid
      if (item.expires) {
        try {
          const expiryDate = new Date(item.expires);
          notExpired = !isNaN(expiryDate) && new Date() <= expiryDate;
        } catch (err) {
          // Invalid date, keep as not expired
          console.error("Invalid expiry date:", item.expires, err);
        }
      }
      // Determine visibility based on role, dismissal, and expiry
      const visible = allowedForRole && notDismissed && notExpired;
      return { ...item, visible };
    });
    const updatedNotifications = [
      ...currentNotifications,
      ...processedNotifications,
    ];
    setNotifications(updatedNotifications);
  };

  //removes a notification
  const removeNotification = async (notification) => {
    //remove the notification from the state
    const updatedNotifications = notifications.filter(
      (item) => item.id !== notification.id
    );
    //remove it in the users notifications.dat file
    await dismissNotification(notification);
    //set the state
    setNotifications(updatedNotifications);
  };

  //dismisses a notification on the server
  const dismissNotification = async (notification) => {
    await _get(
      `dismissNotification?user=${user}&notificationid=${notification.id}`
    );
  };

  //clears all of the dismissed notifications on the server
  const resetNotifications = async () => {
    await _get(`resetNotifications?user=${user}`);
    setDismissedNotifications([]);
    setNotifications([]);
    parseNotifications();
  };

  const appendToFormData = (formData, obj) => {
    // Iterate through the object and add each key/value pair to the FormData
    Object.entries(obj).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  };

  // saveOptions - Options are in users data - use updateUser to update them
  const saveOptions = async (options) => await handleUserUpdate(options);

  //updates the project from the old version to the new version
  const upgradeProject = async (proj) =>
    await _get(`upgradeProject?user=${user}&project=${proj}`);

  //updates the proj parameters back to the server (i.e. the input.dat file)
  const updateProjectParams = async (proj, parameters) => {
    //initialise the form data
    let formData = new FormData();
    formData.append("user", owner);
    formData.append("proj", proj);
    appendToFormData(formData, parameters);
    //post to the server and return a promise
    return await _post("updateProjectParameters", formData);
  };

  //updates a single parameter in the input.dat file directly

  const updateProjectParameter = async (parameter, value) =>
    await updateProjectParams(project, { [parameter]: value });

  //updates the run parameters for the current project
  const updateRunParams = async (array) => {
    //convert the run parameters array into an object
    const parameters = array.reduce((acc, obj) => {
      acc[obj.key] = obj.value;
      return acc;
    }, {});
    await updateProjectParams(project, parameters);
    setRunParams(parameters);
  };

  //gets the planning unit grids
  const getPlanningUnitGrids = async () => {
    const response = await _get("getPlanningUnitGrids");
    setPlanningUnitGrids(response.planning_unit_grids);
  };

  const loadProject = async (proj, user, ...options) => {
    try {
      // Reset the results from any previous projects
      const userResp = options[0];
      const allFeaturesData = options[1];

      resetResults();
      const projectResp = await _get(`getProject?user=${user}&project=${proj}`);
      setRunParams(projectResp.runParameters);
      setProtectedAreaIntersections(projectResp.protectedAreaIntersections);
      setRenderer(projectResp.renderer);
      setProject(projectResp.project);
      setPlanningUnits(projectResp.planningUnits);
      setMetadata(projectResp.metadata);
      setFiles({ ...projectResp.files });
      setCostnames(projectResp.costnames);
      setOwner(user);
      setProjectLoaded(true);
      setPlanningCostsTrigger(true);

      // If PLANNING_UNIT_NAME passed then change to this planning grid and load the results if available
      if (projectResp.metadata.PLANNING_UNIT_NAME) {
        await changePlanningGrid(
          `${CONSTANTS.MAPBOX_USER}.${projectResp.metadata.PLANNING_UNIT_NAME}`
        );
        await getResults(user, projectResp.project);
      }
      // Set a local variable - Dont need to track state with these variables as they are not bound to anything
      setFeaturePreprocessing(projectResp.feature_preprocessing);
      setPreviousIucnCategory(projectResp.metadata.IUCN_CATEGORY);
      // Initialize interest features and preload costs data
      initialiseInterestFeatures(
        projectResp.metadata.OLDVERSION,
        projectResp.features,
        projectResp.feature_preprocessing,
        allFeaturesData
      );

      // Activate the project tab
      dispatch(setActiveTab("project"));
      setPUTabInactive();
      return "Project loaded";
    } catch (error) {
      console.log("error", error);

      if (error.toString().includes("Logged on as read-only guest user")) {
        setLoggedIn(true);
        return "No project loaded - logged on as read-only guest user";
      }

      if (error.toString().includes("does not exist")) {
        // Handle case where project does not exist
        dispatch(setSnackbarMessage("Loading first available project"));
        await loadProject("", user);
        return;
      }

      throw error; // Re-throw the error to handle it outside if needed
    }
  };

  //matches and returns an item in an object array with the passed id - this assumes the first item in the object is the id identifier
  const getArrayItem = (arr, id) => arr.find(([itemId]) => itemId === id);

  //initialises the interest features based on the currently loading project
  const initialiseInterestFeatures = (
    oldVersion,
    projFeatures,
    featurePrePro,
    allFeaturesData
  ) => {
    const allFeats = allFeatures.length > 0 ? allFeatures : allFeaturesData;

    // Determine features based on project version
    const features = oldVersion
      ? projFeatures.map((feature) => ({ ...feature }))
      : [...allFeats];

    // Extract feature IDs
    const projectFeatureIds = projFeatures.map((item) => item.id);

    // Process features
    const processedFeatures = features.map((feature) => {
      // Check if the feature is part of the current project
      const projectFeature = projectFeatureIds.includes(feature.id)
        ? projFeatures[projectFeatureIds.indexOf(feature.id)]
        : null;
      const preprocess = getArrayItem(featurePrePro, feature.id);

      // Add required attributes
      addFeatureAttributes(feature, oldVersion);

      // Populate data if feature is part of the project
      if (projectFeature) {
        Object.assign(feature, {
          selected: true,
          preprocessed: !!preprocess,
          pu_area: preprocess ? preprocess[1] : -1,
          pu_count: preprocess ? preprocess[2] : -1,
          spf: projectFeature.spf,
          target_value: projectFeature.target_value,
          occurs_in_planning_grid: preprocess && preprocess[2] > 0,
        });
      }
      return feature;
    });

    // Get the selected feature ids
    getSelectedFeatureIds();

    // Update state
    setAllFeatures(processedFeatures);
    setProjectFeatures(processedFeatures.filter((item) => item.selected));
  };

  //adds the required attributes for the features to work in the marxan web app - these are the default values
  const addFeatureAttributes = (item, oldVersion) => {
    const defaultAttributes = {
      selected: false, // if the feature is currently selected (i.e. in the current project)
      preprocessed: false, // has the feature already been intersected with the planning grid to populate the puvspr.dat file
      pu_area: -1, // the area of the feature within the planning grid
      pu_count: -1, // the number of planning units that the feature intersects with
      spf: 40, // species penalty factor
      target_value: 17, // the target value for the feature to protect as a percentage
      target_area: -1, // the area of the feature that must be protected to meet the targets percentage
      protected_area: -1, // the area of the feature that is protected
      feature_layer_loaded: false, // is the feature's distribution currently visible on the map
      feature_puid_layer_loaded: false, // are the planning units that intersect the feature currently visible on the map
      old_version: oldVersion, // true if the current project is a project imported from Marxan for DOS
      occurs_in_planning_grid: false, // does the feature occur in the planning grid
      color: window.colors[item.id % window.colors.length], // color for the map layer and analysis outputs
      in_filter: true, // true if the feature is currently visible in the features dialog
    };
    return { ...item, ...defaultAttributes };
  };

  //resets various variables and state in between users
  const resetResults = () => {
    resetRun(); //reset the run
    setCostData(undefined); //reset the cost data
    hideFeatureLayer(); //reset any feature layers that are shown
  };

  //resets state in between runs
  const resetRun = () => {
    setRunMarxanResponse({});
    setSolutions([]);
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // PROJECTS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  const getProjectList = async (obj, _type) => {
    try {
      let projects;

      if (_type === "feature") {
        projects = await getProjectsForFeature(obj);
      } else {
        projects = await getProjectsForPlanningGrid(obj.feature_class_name);
      }

      showProjectListDialog(
        projects,
        "Projects list",
        "The feature is used in the following projects:"
      );
    } catch (error) {
      console.error("Error fetching project list:", error);
      // Optionally: handle the error (e.g., show a user-friendly message)
    }
  };

  //gets a list of projects for a feature
  const getProjectsForFeature = async (feature) => {
    // Fetch the projects associated with the given feature
    const response = await this._get(
      `listProjectsForFeature?feature_class_id=${feature.id}`
    );
    return response.projects;
  };

  // Helper function to prepare form data
  const prepareFormDataNewProject = (proj, user) => {
    const formData = new FormData();
    formData.append("user", user);
    formData.append("project", proj.name);
    formData.append("description", proj.description);
    formData.append("planning_grid_name", proj.planning_grid_name);
    formData.append(
      "interest_features",
      proj.features.map((item) => item.id).join(",")
    );
    formData.append("target_values", proj.features.map(() => 17).join(","));
    formData.append("spf_values", proj.features.map(() => 40).join(","));

    return formData;
  };

  //REST call to create a new import project from the wizard
  const createImportProject = async (proj) => {
    const formData = new FormData();
    formData.append("user", user);
    formData.append("project", proj);
    return await _post("createImportProject", formData);
  };
  const createNewProject = async (proj) => {
    const formData = prepareFormDataNewProject(proj, user);
    const response = await _post("createProject", formData);

    dispatch(setSnackbarMessage(response.info));
    dispatch(toggleDialog({ dialogName: "projectsDialogOpen", isOpen: false }));

    await loadProject(response.name, response.user);
  };

  const createNewNationalProject = async (params) =>
    await createNewPlanningUnitGrid(
      params.iso3,
      params.domain,
      params.areakm2,
      params.shape
    );

  //REST call to delete a specific project
  const deleteProject = async (user, proj, silent = false) => {
    try {
      // Make the request to delete the project
      const response = await _get(`deleteProject?user=${user}&project=${proj}`);

      // Fetch the updated list of projects
      await getProjects();

      // Show a snackbar message, but allow it to be silent if specified
      dispatch(setSnackbarMessage(response.info, silent));

      // Check if the deleted project is the current one
      if (response.project === project) {
        dispatch(
          setSnackbarMessage(
            "Current project deleted - loading first available"
          )
        );

        // Find the next available project
        const nextProject = projects.find((p) => p.name !== project);

        if (nextProject) {
          await loadProject(nextProject.name, user);
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      // Optionally handle the error, e.g., set an error state or notify the user
    }
  };

  //exports the project on the server and returns the *.mxw file
  const exportProject = async (user, proj) => {
    try {
      setActiveTab("log");
      const message = await _ws(
        `exportProject?user=${user}project=${proj}`,
        wsMessageCallback
      );
      return projectState.bpServer.endpoint + "exports/" + message.filename;
    } catch (error) {
      console.log(error);
    }
  };

  const cloneProject = async (user, proj) => {
    const response = await _get(`cloneProject?user=${user}&project=${proj}`);
    getProjects();
    dispatch(setSnackbarMessage(response.info));
  };

  //rename a specific project on the server
  const renameProject = async (newName) => {
    if (newName !== "" && newName !== project) {
      const response = await _get(
        `renameProject?user=${owner}&project=${project}&newName=${newName}`
      );
      setProject(newName);
      dispatch(setSnackbarMessage(response.info));
      return "Project renamed";
    }
  };

  //rename the description for a specific project on the server
  const renameDescription = async (newDesc) => {
    await updateProjectParameter("DESCRIPTION", newDesc);
    setMetadata({ ...metadata, DESCRIPTION: newDesc });
    return "Description Renamed";
  };

  const getProjects = async () => {
    const response = await _get(`getProjects?user=${user}`);
    //filter the projects so that private ones arent shown
    const projects = response.projects.filter(
      (proj) =>
        !(proj.private && proj.user !== user && userData.ROLE !== "Admin")
    );
    setProjects(projects);
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // PREPROCESS AND RUN MARXAN
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //run a marxan job on the server
  const runMarxan = async (event) => {
    startLogging(); // start the logging
    resetProtectedAreas(); // reset all of the protected and target areas for all features
    resetRun(); // reset the run results

    try {
      //update the spec.dat file with any that have been added or removed or changed target or spf
      await updateSpecFile();
      updatePuFile(); // when the species file has been updated, update the planning unit file
    } catch (error) {
      console.error(error);
    }

    try {
      await updatePuvsprFile(); // update the PuVSpr file - preprocessing using websockets
    } catch (error) {
      //updatePuvsprFile error
      console.error(error);
    }

    try {
      const response = await startMarxanJob(owner, project); //start the marxan job
      await getRunLogs(); //update the run log

      if (!checkForErrors(response)) {
        await getResults(response.user, response.project); //run completed - get the results
        setPUTabInactive(); //switch to the features tab
      } else {
        setSolutions([]); //set state with no solutions
      }
    } catch (error) {
      marxanStopped(error);
    }
  };

  //stops a process running on the server
  const stopProcess = async (pid) => {
    try {
      await _get(`stopProcess?pid=${pid}`, 10000);
    } catch (error) {
      console.log(error);
    }
    await getRunLogs();
  };

  //ui feedback when marxan is stopped by the user
  const marxanStopped = async () => await getRunLogs();

  const resetProtectedAreas = () => {
    const updatedFeatures = allFeatures.map((feature) => ({
      ...feature,
      protected_area: -1,
      target_area: -1,
    }));

    // Set the state with updated features
    setAllFeatures(updatedFeatures);
  };

  //updates the species file with any target values that have changed
  const updateSpecFile = async () => {
    const formData = new FormData();
    formData.append("user", owner);
    formData.append("project", project);
    //prepare the data that will populate the spec.dat file
    formData.append(
      "interest_features",
      projectFeatures.map((item) => item.id).join(",")
    );
    formData.append(
      "target_values",
      projectFeatures.map((item) => item.target_value).join(",")
    );
    formData.append(
      "spf_values",
      projectFeatures.map((item) => item.spf).join(",")
    );
    return await _post("updateSpecFile", formData);
  };

  //updates the planning unit file with any changes - not implemented yet
  const updatePuFile = () => {};

  const updatePuvsprFile = async () => {
    try {
      // Preprocess features to create the puvspr.dat file on the server
      // Done on demand when the project is run because the user may add/remove Conservation features dynamically
      await preprocessAllFeatures();
    } catch (error) {
      console.error("Error updating PuVSpr file:", error);
      throw error; // Rethrow the error to be handled by the caller if necessary
    }
  };
  //preprocess a single feature

  const preprocessSingleFeature = async (feature) => {
    setFeatureMenuOpen(false);
    startLogging();
    preprocessFeature(feature);
  };

  //preprocess synchronously, i.e. one after another
  const preprocessAllFeatures = async () => {
    for (const feature of projectFeatures) {
      if (!feature.preprocessed) {
        await preprocessFeature(feature);
      }
    }
  };

  //preprocesses a feature using websockets - i.e. intersects it with the planning units grid and writes the intersection results into the puvspr.dat file ready for a marxan run - this will have no server timeout as its running using websockets
  const preprocessFeature = async (feature) => {
    try {
      // Switch to the log tab
      setActiveTab("log");

      // Call the WebSocket
      const message = await _ws(
        `preprocessFeature?user=${owner}&project=${project}&planning_grid_name=${metadata.PLANNING_UNIT_NAME}&feature_class_name=${feature.feature_class_name}&alias=${feature.alias}&id=${feature.id}`,
        wsMessageCallback
      );

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

  //calls the marxan executeable and runs it getting the output streamed through websockets
  const startMarxanJob = async (user, proj) => {
    try {
      // Make the request to get the Marxan data
      return await _ws(
        `runMarxan?user=${user}&project=${proj}`,
        wsMessageCallback
      );
    } catch (error) {
      console.error("Error starting Marxan job:", error);
      throw error; // Re-throw the error to handle it further up the call stack if needed
    }
  };

  //gets the results for a project
  const getResults = async (user, proj) => {
    try {
      const response = await _get(`getResults?user=${user}&project=${proj}`);
      runCompleted(response);
      return "Results retrieved";
    } catch (error) {
      console.error("Unable to get results:", error);
      throw new Error("Unable to get results"); // Optionally re-throw the error for further handling
    }
  };

  //run completed
  const runCompleted = (response) => {
    setRunMarxanResponse(response);

    // Check if solutions are present
    if (response.ssoln?.length > 0) {
      dispatch(setSnackbarMessage(response.info));
      renderSolution(response.ssoln, true);

      // Map the solutions to the required format
      const solutions = response.summary.map((item) => {
        return {
          Run_Number: item[0],
          Score: Number(item[1]).toFixed(1),
          Cost: Number(item[2]).toFixed(1),
          Planning_Units: item[3],
          Missing_Values: item[12],
        };
      });

      // Add the summed solution row
      solutions.unshift({
        Run_Number: "Sum",
        Score: "",
        Cost: "",
        Planning_Units: "",
        Missing_Values: "",
      });

      updateProtectedAmount(response.mvbest);
      setSolutions(solutions);
    } else {
      // No solutions available
      setSolutions([]);
    }
  };

  // Get the protected area information in m2 from marxan run and populate interest features with the values
  const updateProtectedAmount = (mvData) => {
    // Create a map for quick lookup of mvData by feature ID
    const mvDataMap = new Map(
      mvData.map(([id, , targetArea, protectedArea]) => [
        id,
        { targetArea, protectedArea },
      ])
    );

    // Update features with corresponding data from mvData
    const updatedFeatures = allFeatures.map((feature) => {
      const mvItem = mvDataMap.get(feature.id);
      if (mvItem) {
        return {
          ...feature,
          target_area: mvItem.targetArea,
          protected_area: mvItem.protectedArea,
        };
      }
      return feature;
    });

    // Update state with the updated features
    setAllFeatures(updatedFeatures);
    setProjectFeatures(updatedFeatures.filter((item) => item.selected));
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // IMPORT PROJECT ROUTINES
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  // Uploads a single file to a specific folder - value is the filename
  const uploadFileToFolder = async (value, filename, destFolder) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("value", value); // The binary data for the file
    formData.append("filename", filename); // The filename
    formData.append("destFolder", destFolder); // The folder to upload to

    try {
      return await _post("uploadFileToFolder", formData);
    } catch (error) {
      throw new Error("Failed to upload file to folder");
    }
  };

  //uploads a list of files to the current project
  const uploadFiles = async (files, proj) => {
    for (const file of files) {
      if (file.name.endsWith(".dat")) {
        const formData = new FormData();
        formData.append("user", owner);
        formData.append("project", proj);

        const filepath = file.webkitRelativePath.split("/").slice(1).join("/");
        formData.append("filename", filepath);
        formData.append("value", file);

        messageLogger({
          method: "uploadFiles",
          status: "Uploading",
          info: `Uploading: ${file.webkitRelativePath}`,
        });

        await _post("uploadFile", formData);
      }
    }
  };

  //uploads a single file to the current projects input folder
  const uploadFileToProject = async (value, filename) => {
    const formData = new FormData();
    formData.append("user", owner);
    formData.append("project", project);
    formData.append("filename", `input/${filename}`);
    formData.append("value", value);

    try {
      return await _post("uploadFile", formData);
    } catch (error) {
      throw new Error("Failed to upload file");
    }
  };

  const importProject = async (
    proj,
    description,
    zipFilename,
    files,
    planning_grid_name
  ) => {
    let feature_class_name = "";
    let uploadId;

    startLogging();
    messageLogger({
      method: "importProject",
      status: "Importing",
      info: "Starting import..",
    });

    // Create a new project
    await createImportProject(proj);
    messageLogger({
      method: "importProject",
      status: "Importing",
      info: `Project '${proj}' created`,
    });

    try {
      // Import the planning unit file
      const puResponse = await importZippedShapefileAsPu(
        zipFilename,
        planning_grid_name,
        `Imported with the project '${proj}'`
      );
      feature_class_name = puResponse.feature_class_name;
      uploadId = puResponse.uploadId;

      messageLogger({
        method: "importProject",
        status: "Importing",
        info: "Planning grid imported",
      });
    } catch (error) {
      deleteProject(user, proj, true);
      throw error;
    }

    try {
      // Upload all the files
      await uploadFiles(files, proj);
      messageLogger({
        method: "importProject",
        status: "Importing",
        info: "All files uploaded",
      });

      // Upgrade the project to the new version of Marxan
      await upgradeProject(proj);
      messageLogger({
        method: "importProject",
        status: "Importing",
        info: "Project updated to new version",
      });

      // Update project parameters
      const formattedDate = new Date()
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .replace(",", "");

      await updateProjectParams(proj, {
        DESCRIPTION: `${description} (imported from an existing Marxan proj)`,
        CREATEDATE: formattedDate,
        OLDVERSION: "True",
        PLANNING_UNIT_NAME: feature_class_name,
        OUTPUTDIR: "output",
      });

      // Poll Mapbox and complete the import
      await pollMapbox(uploadId);
      await getPlanningUnitGrids();
      messageLogger({
        method: "importProject",
        status: "Finished",
        info: "Import complete",
      });

      // Load the proj
      await loadProject(proj, user);
      return "Import complete";
    } catch (error) {
      messageLogger({
        method: "importProject",
        status: "Failed",
        info: "Import failed",
      });
      // Handle specific errors here if needed, like rolling back project creation, deleting files, etc.
      throw error;
    }
  };

  //pads a number with zeros to a specific size, e.g. pad(9,5) => 00009
  const pad = (num, size) => num.toString().padStart(size, "0");

  //imports a project from an mxd file
  const importMXWProject = async (proj, description, filename) => {
    startLogging();
    await _ws(
      `importProject?user=${user}&project=${proj}&filename=${filename}&description=$description}`,
      wsMessageCallback
    );
    refreshFeatures();
    loadProject(proj, user);
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // SOLUTIONS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  //load a specific solution for the current project
  const loadSolution = async (solution) => {
    if (solution === "Sum") {
      updateProtectedAmount(runMarxanResponse.mvbest);
      //load the sum of solutions which will already be loaded
      renderSolution(runMarxanResponse.ssoln, true);
    } else {
      const response = await getSolution(owner, project, solution);
      updateProtectedAmount(response.mv);
      renderSolution(response.solution, false);
    }
  };

  // Load a solution from another project - used in the clumping dialog - when the solution is loaded the paint properties are set on the individual maps through state changes
  const loadOtherSolution = async (user, proj, solution) => {
    const response = await getSolution(user, proj, solution);
    const paintProperties = getPaintProperties(response.solution, false, false);
    // Get the proj that matches the proj name from the this.projs property - this was set when the projGroup was created
    if (projects) {
      const _projects = projects.filter((item) => item.projectName === proj);
      // Get which clump it is
      const clump = _projects[0].clump;
      setMapPaintProperties({ [`mapPP${clump}`]: paintProperties });
    }
  };

  // Gets a solution
  const getSolution = async (user, proj, solution) =>
    await _get(`getSolution?user=${user}&project=${proj}&solution=${solution}`);

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // CLASSIFICATION AND RENDERING
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  //gets the total number of planning units in the ssoln and outputs the statistics of the distribution to state, e.g. 2 PUs with a value of 1, 3 with a value of 2 etc.
  const getssolncount = (data) => {
    let total = 0;
    const summaryStats = data.map((item) => {
      const count = item[1].length;
      total += count;
      return { number: item[0], count };
    });

    setSummaryStats(summaryStats);
    return total;
  };

  //gets a sample of the data to be able to do a classification, e.g. natural breaks, jenks etc.
  const getSsolnSample = (data, sampleSize) => {
    const ssolnLength = getssolncount(data);
    // Use the ceiling function to force outliers to be in the classification, i.e. those planning units that were only selected in 1 solution
    return data.flatMap((item) => {
      const num = Math.ceil((item[1].length / ssolnLength) * sampleSize);
      return Array(num).fill(item[0]);
    });
  };

  //get all data from the ssoln arrays
  const getSsolnData = (data) => data.flatMap((item) => item[1]);

  // Gets the classification and colorbrewer object for doing the rendering
  const classifyData = (data, numClasses, colorCode, classification) => {
    //get a sample of the data to make the renderer classification
    const sample = getSsolnSample(data, 1000); //samples dont work
    // let sample = this.getSsolnData(data); //get all the ssoln data
    brew.setSeries(sample);
    const brew = brew;
    const renderer = renderer;
    // If the colorCode is opacity then calculate the rgba values dynamically and add them to the color schemes
    if (colorCode === "opacity") {
      const { opacity } = brew.colorSchemes;

      //see if we have already created a brew color scheme for opacity with NUMCLASSES
      if (!opacity || !opacity[renderer.NUMCLASSES]) {
        const newBrewColorScheme = Array.from(
          { length: renderer.NUMCLASSES },
          (_, index) =>
            `rgba(255,0,136,${(1 / renderer.NUMCLASSES) * (index + 1)})`
        );
        //add the new color scheme
        if (brew.colorSchemes.opacity === undefined) {
          brew.colorSchemes.opacity = [];
        }
        // Update the Brew color schemes state
        setBrew((prevState) => ({
          ...prevState, // Spread the existing state
          colorSchemes: {
            ...prevState.colorSchemes, // Use prevState to maintain the existing colorSchemes
            opacity: {
              ...prevState.colorSchemes.opacity, // Preserve existing opacity settings
              [renderer.NUMCLASSES]: newBrewColorScheme, // Add or update the NUMCLASSES key
            },
          },
        }));
      }
    }
    // Set the color code - see the color theory section on Joshua Tanners page here https://github.com/tannerjt/classybrew - for all the available colour codes
    brew.setColorCode(colorCode);
    //get the maximum number of colors in this scheme
    const colorSchemeLength = getMaxNumberOfClasses(brew, colorCode);
    //check the color scheme supports the passed number of classes
    if (numClasses > colorSchemeLength) {
      //set the numClasses to the max for the color scheme
      numClasses = colorSchemeLength;
      //reset the renderer
      setRenderer((prevState) => ({
        ...prevState,
        NUMCLASSES: finalNumClasses, // Update or add the NUMCLASSES property
      }));
    }
    //set the number of classes
    brew.setNumClasses(numClasses);
    //set the classification method - one of equal_interval, quantile, std_deviation, jenks (default)
    brew.classify(classification);
  };

  //called when the renderer state has been updated - renders the solution and saves the renderer back to the server
  const rendererStateUpdated = async (parameter, value) => {
    renderSolution(runMarxanResponse.ssoln, true);
    if (userData.ROLE !== "ReadOnly")
      await updateProjectParameter(parameter, value);
  };

  //change the renderer, e.g. jenks, natural_breaks etc.
  const changeRenderer = async (renderer) => {
    // Update state and wait for the update to complete
    setRenderer((prevState) => ({
      ...prevState,
      CLASSIFICATION: renderer,
    }));

    // Call the async function after the state has been updated
    await rendererStateUpdated("CLASSIFICATION", renderer);
  };

  //change the number of classes of the renderer
  const changeNumClasses = async (numClasses) => {
    setRenderer((prevState) => ({
      ...prevState,
      NUMCLASSES: numClasses,
    }));
    // Call the async function after the state has been updated
    await rendererStateUpdated("NUMCLASSES", numClasses);
  };

  const changeColorCode = async (colorCode) => {
    // Ensure NUMCLASSES is not greater than the max allowed by brew
    const newState = { COLORCODE: colorCode };
    if (renderer.NUMCLASSES > brew.getNumClasses()) {
      newState[NUMCLASSES] = brew.getNumClasses();
    }
    setRenderer((prevState) => ({
      ...prevState,
      ...newState,
    }));
    await rendererStateUpdated("COLORCODE", colorCode);
  };

  //change how many of the top classes only to show
  const changeShowTopClasses = async (numClasses) => {
    setRenderer((prevState) => ({
      ...prevState,
      TOPCLASSES: numClasses,
    }));
    await rendererStateUpdated("TOPCLASSES", numClasses);
  };

  // Helper function to get visible value based on renderer settings
  const getVisibleValue = (renderer, brew) => {
    if (renderer.TOPCLASSES < renderer.NUMCLASSES) {
      const breaks = brew.getBreaks();
      return breaks[renderer.NUMCLASSES - renderer.TOPCLASSES + 1];
    }
    return 0;
  };

  // Helper function to update expressions based on value
  const updateExpressions = (row, value, color, visibleValue, expressions) => {
    const [fillColorExpr, fillOutlineColorExpr] = expressions;
    if (value >= visibleValue) {
      fillColorExpr.push(row[1], color);
      fillOutlineColorExpr.push(row[1], "rgba(150, 150, 150, 0.6)"); // gray outline
    } else {
      fillColorExpr.push(row[1], "rgba(0, 0, 0, 0)");
      fillOutlineColorExpr.push(row[1], "rgba(0, 0, 0, 0)");
    }
  };

  //initialises the fill color expression for matching on attributes values
  const initialiseFillColorExpression = (attribute) => [
    "match",
    ["get", attribute],
  ];

  //gets the various paint properties for the planning unit layer - if setRenderer is true then it will also update the renderer in the Legend panel
  const getPaintProperties = (data, sum, setRenderer) => {
    // Get the matching puids with different numbers of 'numbers' in the marxan results
    const fill_color_expression = initialiseFillColorExpression("puid");
    const fill_outline_color_expression = initialiseFillColorExpression("puid");

    if (data.length > 0) {
      let color, visibleValue, value;
      // Create renderer using classybrew library - https://github.com/tannerjt/classybrew

      if (setRenderer) {
        classifyData(
          data,
          Number(renderer.NUMCLASSES),
          renderer.COLORCODE,
          renderer.CLASSIFICATION
        );
      }

      //if only the top n classes will be rendered then get the visible value at the boundary
      visibleValue = getVisibleValue(renderer, brew);

      // the rest service sends the data grouped by the 'number', e.g. [1,[23,34,36,43,98]],[2,[16,19]]
      data.forEach((row) => {
        value = row[0];
        // For each row add the puids and the color to the expression, e.g. [35,36,37],"rgba(255, 0, 136,0.1)"
        if (sum) {
          // Multi-value rendering
          color = brew.getColorInRange(value);
          updateExpressions(row, value, color, visibleValue, [
            fillColorExpression,
            fillOutlineColorExpression,
          ]);
        } else {
          // Single-value rendering
          fillColorExpression.push(row[1], "rgba(255, 0, 136,1)");
          fillOutlineColorExpression.push(row[1], "rgba(150, 150, 150, 0.6)"); // gray outline
        }
      });

      // Add default color for missing data
      fill_color_expression.push("rgba(0,0,0,0)");
      fill_outline_color_expression.push("rgba(0,0,0,0)");
    } else {
      // No data case
      return {
        fillColor: "rgba(0, 0, 0, 0)",
        outlineColor: "rgba(0, 0, 0, 0)",
      };
    }

    return {
      fillColor: fillColorExpression,
      outlineColor: fillOutlineColorExpression,
    };
  };

  const getColorForStatus = (val) => {
    switch (val) {
      case 1: //The PU will be included in the initial reserve system but may or may not be in the final solution.
        return "rgba(63, 191, 63, 1)";
      case 2: // Locked in
        return "rgba(63, 63, 191, 1)";
      case 3: // Locked out
        return "rgba(191, 63, 63, 1)";
      default:
        return "rgba(150, 150, 150, 0)"; // Default color
    }
  };

  //renders the solution - data is the REST response and sum is a flag to indicate if the data is the summed solution (true) or an individual solution (false)
  const renderSolution = (data, sum) => {
    if (!data) return;
    const paintProperties = getPaintProperties(data, sum, true);
    //set the render paint property
    map.current.setPaintProperty(
      CONSTANTS.RESULTS_LAYER_NAME,
      "fill-color",
      paintProperties.fillColor
    );
    map.current.setPaintProperty(
      CONSTANTS.RESULTS_LAYER_NAME,
      "fill-outline-color",
      paintProperties.oulineColor
    );
  };

  //renders the planning units edit layer according to the type of layer and pu status
  const renderPuEditLayer = () => {
    const buildExpression = (units) => {
      if (units.length === 0) {
        return "rgba(150, 150, 150, 0)"; // Default color when no data
      }

      const expression = ["match", ["get", "puid"]];
      units.forEach((row, index) =>
        expression.push(row[1], getColorForStatus(row[0]))
      );
      // Default color for planning units not explicitly mentioned
      expression.push("rgba(150, 150, 150, 0)");
      return expression;
    };

    const expression = buildExpression(planningUnits);

    //set the render paint property
    map.current.setPaintProperty(
      CONSTANTS.STATUS_LAYER_NAME,
      "line-color",
      expression
    );
    map.current.setPaintProperty(
      CONSTANTS.STATUS_LAYER_NAME,
      "line-width",
      CONSTANTS.STATUS_LAYER_LINE_WIDTH
    );
  };

  //renders the planning units cost layer according to the cost for each planning unit
  const renderPuCostLayer = (cost_data) => {
    const buildExpression = (data) => {
      if (data.length === 0) {
        return "rgba(150, 150, 150, 0.7)"; // Default color if no cost data
      }

      const expression = ["match", ["get", "puid"]];
      data.forEach((row, index) => {
        if (row[1].length > 0) {
          expression.push(row[1], CONSTANTS.COST_COLORS[index]);
        }
      });
      expression.push("rgba(150, 150, 150, 0)"); // Default color for missing data
      return expression;
    };

    const expression = buildExpression(cost_data.data);
    map.current.setPaintProperty(
      CONSTANTS.COSTS_LAYER_NAME,
      "fill-color",
      expression
    );
    setLayerMetadata(CONSTANTS.COSTS_LAYER_NAME, {
      min: cost_data.min,
      max: cost_data.max,
    });
    showLayer(CONSTANTS.COSTS_LAYER_NAME);
    return "Costs rendered";
  };

  // Convenience method to get rendered features safely & not show error message if the layer doesnt exist in the map style
  const getRenderedFeatures = (pt, layers) =>
    map.current.getLayer(layers[0])
      ? map.current.queryRenderedFeatures(pt, { layers: layers })
      : [];

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // MAP INSTANTIATION, LAYERS ADDING/REMOVING AND INTERACTION
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //instantiates the mapboxgl map
  const createMap = (url) => {
    // Initialize map only once
    if (map.current) {
      console.log("Map already initialized.");
      return;
    }

    // Create a new Mapbox map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: url || "mapbox://styles/mapbox/streets-v12", // default style if no URL provided
      center: [-13, 55], // your map's initial coordinates
      zoom: 4, // your map's initial zoom level
    });

    // Event handlers
    map.current.on("load", mapLoaded); // Triggered when the map loads
    map.current.on("error", mapError); // Triggered on map errors
    map.current.on("click", mapClick); // Triggered on map click events
    map.current.on("styledata", mapStyleChanged); // Triggered when map style changes

    // Return a promise to resolve when the map's style is fully loaded
    return new Promise((resolve) => {
      map.current.on("style.load", () => {
        resolve("Map style loaded");
      });
    });
  };

  const mapLoaded = (e) => {
    // map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-right'); // currently full screen hides the info panel and setting position:absolute and z-index: 10000000000 doesnt work properly
    map.current.addControl(new mapboxgl.ScaleControl());
    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(new HomeButton());
    //create the draw controls for the map
    setMapboxDrawControls(
      new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: "draw_polygon",
      })
    );
    map.current.on("moveend", (evt) => {
      if (dialogStates.clumpingDialogOpen) updateMapCentreAndZoom(); //only update the state if the clumping dialog is open
    });
    map.current.on("draw.create", polygonDrawn);
  };

  const updateMapCentreAndZoom = () => {
    setMapCentre(map.current.getCenter());
    setMapZoom(map.current.getZoom());
  };

  //catch all event handler for map errors
  const mapError = useCallback((e) => {
    console.log("Map error e: ", e);

    let message = "";
    switch (e.error.message) {
      case "Not Found":
        message = `The tileset '${e.source.url}' was not found`;
        break;
      case "Bad Request":
        message = `The tileset from source '${e.sourceId}' was not found. See <a href='${CONSTANTS.ERRORS_PAGE}#the-tileset-from-source-source-was-not-found' target='blank'>here</a>`;
        break;
      default:
        message = e.error.message;
        break;
    }

    if (
      message !== "http status 200 returned without content." ||
      message == ""
    ) {
      dispatch(
        setSnackbarMessage(
          `MapError: ${message}, Error status: ${e.error.status}`
        )
      );
      console.error(message);
    }
  }, []);

  const handleInfoMenuItemClick = () => {
    setOpenInfoDialogOpen(true);
    setFeatureMenuOpen(false);
  };

  const mapClick = async (e) => {
    //if the user is not editing planning units or creating a new feature then show the identify features for the clicked point
    if (!puEditing && !map.current.getSource("mapbox-gl-draw-cold")) {
      //get a list of the layers that we want to query for features
      const featureLayers = getLayers([
        CONSTANTS.LAYER_TYPE_PLANNING_UNITS,
        CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS,
        CONSTANTS.LAYER_TYPE_PROTECTED_AREAS,
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
      ]);
      // Get the feature layer ids, get a list of all of the rendered features that were clicked on - these will be planning units, features and protected areas
      // Set the popup point, get any planning unit features under the mouse
      const featureLayerIds = featureLayers.map((item) => item.id);
      const clickedFeatures = getRenderedFeatures(e.point, featureLayerIds);
      const puFeatures = getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_pu_"
      );
      if (puFeatures.length && puFeatures[0].properties.puid) {
        await getPUData(puFeatures[0].properties.puid);
      }
      setPopupPoint(e.point);
      // Get any conservation features under the mouse
      // Might be dupliate conservation features (e.g. with GBIF data) so get a unique list of sourceLayers
      // Get the full features data from the state.projectFeatures array

      let idFeatures = getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_feature_layer_"
      );
      const uniqueSourceLayers = Array.from(
        new Set(idFeatures.map((item) => item.sourceLayer))
      );
      idFeatures = uniqueSourceLayers.map((sourceLayer) =>
        projectFeatures.find(
          (feature) => feature.feature_class_name === sourceLayer
        )
      );

      //get any protected area features under the mouse
      const idProtectedAreas = getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_wdpa_"
      );

      //set the state to populate the identify popup
      setIdentifyVisible(true);
      setIdentifyFeatures(idFeatures);
      setidentifyProtectedAreas(idProtectedAreas);
    }
  };

  //called when layers are added/removed or shown/hidden
  const mapStyleChanged = (e) => updateLegend();

  //after a layer has been added/removed/shown/hidden update the legend items
  const updateLegend = () => {
    // Get the visible Marxan layers
    const visibleLayers = map.current
      .getStyle()
      .layers.filter(
        (layer) =>
          layer.id.startsWith("marxan_") &&
          layer.layout.visibility === "visible"
      );
    setVisibleLayers(visibleLayers);
  };

  //gets a set of features that have a layerid that starts with the passed text
  const getFeaturesByLayerStartsWith = (features, startsWith) =>
    features.filter((item) => item.layer.id.startsWith(startsWith));

  //gets a list of features for the planning unit
  const getPUData = async (puid) => {
    const response = await _get(
      `getPUData?user=${owner}&project=${project}&puid=${puid}`
    );
    if (response.data.features.length) {
      //if there are some features for the planning unit join the ids onto the full feature data from the state.projectFeatures array
      joinArrays(response.data.features, projectFeatures, "species", "id");
    }
    //set the state to update the identify popup
    setIdentifyPlanningUnits({
      puData: response.data.pu_data,
      features: response.data.features,
    });
  };

  //joins a set of data from one object array to another
  const joinArrays = (arr1, arr2, leftId, rightId) => {
    return arr1.map((item1) => {
      // Find the matching item in the second array
      const matchingItem = arr2.find(
        (item2) => item2[rightId] === item1[leftId]
      );
      // Merge the items if a match is found
      return matchingItem ? { ...item1, ...matchingItem } : item1;
    });
  };

  //hides the identify popup
  const hideIdentifyPopup = (e) => {
    setIdentifyVisible(false);
    setIdentifyPlanningUnits({});
  };
  //sets the basemap either on project load, or if the user changes it
  const loadBasemap = async (basemap) => {
    try {
      setBasemap(basemap.name);
      const style = await getValidStyle(basemap);
      await createMap(style);
      addWDPASource();
      addWDPALayer();

      // Add the planning unit layers (if a project has already been loaded)
      if (tileset) {
        addPlanningGridLayers(tileset);

        // Get the results, if any
        if (owner) {
          await getResults(owner, project);
        }

        // Turn on/off layers depending on which tab is selected
        if (uiState.activeTab === "planningUnits") {
          setPUTabActive();
        }
      }
    } catch (error) {
      console.error("Error setting basemap:", error);
    }
  };

  //gets the style JSON either as a valid TileJSON object or as a url to a valid TileJSON object
  const getValidStyle = async (basemap) => {
    switch (basemap.provider) {
      case "esri":
        // Load the ESRI style dynamically and return the parsed TileJSON object
        // Fetch the style JSON
        const response = await fetch(basemap.id);
        const style = await response.json();

        // Fetch metadata for the raw tiles
        const TileJSON = style.sources.esri.url;
        const metadataResponse = await fetch(TileJSON);
        const metadata = await metadataResponse.json();

        // Construct the tiles URL
        const tilesurl = metadata.tiles[0].startsWith("/")
          ? TileJSON + metadata.tiles[0]
          : TileJSON + "/" + metadata.tiles[0];

        // Update the style with the fetched metadata
        style.sources.esri = {
          type: "vector",
          scheme: "xyz",
          tilejson: metadata.tilejson || "2.0.0",
          format: metadata.tileInfo?.format || "pbf",
          maxzoom: 15,
          tiles: [tilesurl],
          description: metadata.description,
          name: metadata.name,
        };
        return style;

      case "local":
        // Return a blank background style
        return {
          version: 8,
          name: "blank",
          sources: {
            openmaptiles: {
              type: "vector",
              url: "",
            },
          },
          layers: [
            {
              id: "background",
              type: "background",
              paint: {
                "background-color": "#ffffff",
              },
            },
          ],
        };
      default:
        // Return the style URL for either Mapbox or JRC
        return CONSTANTS.MAPBOX_STYLE_PREFIX + basemap.id;
    }
  };

  const changePlanningGrid = async (tilesetid) => {
    try {
      // Get the tileset metadata
      const tileset = await getMetadata(tilesetid);

      // Remove the existing layers (e.g., results layer, planning unit layer)
      removePlanningGridLayers();

      // Add the new planning grid layers using the obtained tileset
      addPlanningGridLayers(tileset);

      // Zoom to the layers' extent if bounds are available
      if (tileset.bounds) {
        zoomToBounds(map, tileset.bounds);
      }

      // Update the state with the new tileset information
      setTileset(tileset);
      return tileset;
    } catch (error) {
      dispatch(setSnackbarMessage(error));
      throw error;
    }
  };

  //gets all of the metadata for the tileset
  const getMetadata = async (tilesetId) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/v4/${tilesetId}.json?secure&access_token=pk.eyJ1IjoiY3JhaWNlcmphY2siLCJhIjoiY2syeXhoMjdjMDQ0NDNnbDk3aGZocWozYiJ9.T-XaC9hz24Gjjzpzu6RCzg`
      );

      const data = await response.json();

      if (data.message && data.message.includes("does not exist")) {
        throw new Error(
          `The tileset '${tilesetId}' was not found. See <a href='${CONSTANTS.ERRORS_PAGE}#the-tileset-from-source-source-was-not-found' target='_blank'>here</a>`
        );
      }
      return data;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      throw error;
    }
  };

  //adds the results, planning unit, planning unit edit etc layers to the map
  const addPlanningGridLayers = (tileset) => {
    //add the source for the planning unit layers
    map.current.addSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME, {
      type: "vector",
      url: "mapbox://" + tileset.id,
    });

    //add the results layer
    addMapLayer({
      id: CONSTANTS.RESULTS_LAYER_NAME,
      metadata: {
        name: "Results",
        type: CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS,
      },
      type: "fill",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "visible",
      },
      "source-layer": tileset.name,
      paint: {
        "fill-color": "rgba(0, 0, 0, 0)",
        "fill-outline-color": "rgba(0, 0, 0, 0)",
        "fill-opacity": CONSTANTS.RESULTS_LAYER_OPACITY,
      },
    });
    //add the planning units costs layer
    addMapLayer({
      id: CONSTANTS.COSTS_LAYER_NAME,
      metadata: {
        name: "Planning Unit Cost",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST,
      },
      type: "fill",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "none",
      },
      "source-layer": tileset.name,
      paint: {
        "fill-color": "rgba(255, 0, 0, 0)",
        "fill-outline-color": "rgba(150, 150, 150, 0)",
        "fill-opacity": CONSTANTS.PU_COSTS_LAYER_OPACITY,
      },
    });
    //set the result layer in app state so that it can update the Legend component and its opacity control
    setResultsLayer(map.current.getLayer(CONSTANTS.RESULTS_LAYER_NAME));
    //add the planning unit layer
    addMapLayer({
      id: CONSTANTS.PU_LAYER_NAME,
      metadata: {
        name: "Planning Unit",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS,
      },
      type: "fill",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "none",
      },
      "source-layer": tileset.name,
      paint: {
        "fill-color": "rgba(0, 0, 0, 0)",
        "fill-outline-color":
          "rgba(150, 150, 150, " + CONSTANTS.PU_LAYER_OPACITY + ")",
        "fill-opacity": CONSTANTS.PU_LAYER_OPACITY,
      },
    });
    //add the planning units manual edit layer - this layer shows which individual planning units have had their status changed
    addMapLayer({
      id: CONSTANTS.STATUS_LAYER_NAME,
      metadata: {
        name: "Planning Unit Status",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS,
      },
      type: "line",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "none",
      },
      "source-layer": tileset.name,
      paint: {
        "line-color": "rgba(150, 150, 150, 0)",
        "line-width": CONSTANTS.STATUS_LAYER_LINE_WIDTH,
      },
    });
  };

  const removePlanningGridLayers = () => {
    const sourceName = CONSTANTS.PLANNING_UNIT_SOURCE_NAME;
    let layers = map.current.getStyle().layers;
    // Get dynamically added layers, remove them, and then remove sources
    const dynamicLayers = layers.filter((item) => item.source === sourceName);
    dynamicLayers.forEach((item) => removeMapLayer(item.id));
    if (map.current.getSource(sourceName)) {
      map.current.removeSource(sourceName);
    }
  };

  //adds the WDPA vector tile layer source - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  const addWDPASource = () => {
    //add the source for the wdpa
    const yr = projectState.bpServer.wdpa_version.substr(-4); //get the year from the wdpa_version
    const attribution = `IUCN and UNEP-WCMC (${yr}), The World Database on Protected Areas (WDPA) ${projectState.bpServer.wdpa_version}, Cambridge, UK: UNEP-WCMC. Available at: <a href='http://www.protectedplanet.net'>www.protectedplanet.net</a>`;

    const tiles = [
      `${registry.WDPA.tilesUrl}layer=marxan:${wdpaVectorTileLayer}&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}`,
    ];

    setWdpaAttribution(attribution);
    map.current.addSource(CONSTANTS.WDPA_SOURCE_NAME, {
      attribution: attribution,
      type: "vector",
      tiles: tiles,
    });
  };

  //adds the WDPA vector tile layer - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  const addWDPALayer = () => {
    const fills = {
      type: "categorical",
      property: "marine",
      stops: [
        ["0", "rgb(99,148,69)"],
        ["1", "rgb(63,127,191)"],
        ["2", "rgb(63,127,191)"],
      ],
    };

    addMapLayer({
      id: CONSTANTS.WDPA_LAYER_NAME,
      metadata: {
        name: "Protected Areas",
        type: CONSTANTS.LAYER_TYPE_PROTECTED_AREAS,
      },
      type: "fill",
      source: CONSTANTS.WDPA_SOURCE_NAME,
      "source-layer": wdpaVectorTileLayer,
      layout: {
        visibility: "visible",
      },
      // "filter": ["==", "wdpaid", -1],
      paint: {
        "fill-color": fills,
        "fill-outline-color": fills,
        "fill-opacity": CONSTANTS.WDPA_FILL_LAYER_OPACITY,
      },
    });
    //set the wdpa layer in app state so that it can update the Legend component and its opacity control
    setWdpaLayer(map.current.getLayer(CONSTANTS.WDPA_LAYER_NAME));
  };

  const toggleLayerVisibility = (id, visibility) => {
    if (map.current.getLayer(id))
      map.current.setLayoutProperty(id, "visibility", visibility);
  };

  const showLayer = (id) => toggleLayerVisibility(id, "visible");

  const hideLayer = (id) => toggleLayerVisibility(id, "none");

  //centralised code to add a layer to the maps current style
  const addMapLayer = (mapLayer, beforeLayer) => {
    // If a beforeLayer is not passed get the first symbol layer (i.e. label layer)
    if (!beforeLayer) {
      const symbolLayers = map.current
        .getStyle()
        .layers.filter((item) => item.type === "symbol");
      beforeLayer = symbolLayers.length ? symbolLayers[0].id : "";
    }
    // Add the layer to the map
    map.current.addLayer(mapLayer, beforeLayer);
  };

  //centralised code to remove a layer from the maps current style
  const removeMapLayer = (layerid) => map.current.removeLayer(layerid);

  const isLayerVisible = (layername) =>
    map.current &&
    map.current.getLayer(layername) &&
    map.current.getLayoutProperty(layername, "visibility") === "visible";

  //changes the layers opacity
  const changeOpacity = (layerId, opacity) => {
    if (map) {
      let layer = map.current.getLayer(layerId);
      switch (layer.type) {
        case "circle":
          map.current.setPaintProperty(layerId, "circle-opacity", opacity);
          break;
        case "fill":
          map.current.setPaintProperty(layerId, "fill-opacity", opacity);
          break;
        case "line":
          map.current.setPaintProperty(layerId, "line-opacity", opacity);
          break;
        default:
        // code
      }
    }
  };

  //sets the metadata for the layer
  const setLayerMetadata = (layerId, metadata) => {
    const layer = map.current.getLayer(layerId);
    if (layer) {
      // Use spread operator to merge metadata
      layer.metadata = { ...layer.metadata, ...metadata };
    }
  };

  //gets a particular set of layers based on the layer types (layerTypes is an array of layer types)
  const getLayers = (layerTypes) => {
    const allLayers = map.current.getStyle().layers;

    return allLayers.filter(
      ({ metadata }) => metadata?.type && layerTypes.includes(metadata.type)
    );
  };

  //shows/hides layers of a particular type (layerTypes is an array of layer types)
  const showHideLayerTypes = (layerTypes, show) => {
    const layers = getLayers(layerTypes);
    layers.forEach((layer) =>
      show ? showLayer(layer.id) : hideLayer(layer.id)
    );
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // TABS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //fired when the planning unit tab is selected
  const setPUTabActive = async () => {
    dispatch(setActiveTab("planningUnits"));
    //show the planning units layer, status layer, and costs layer
    showLayer(CONSTANTS.PU_LAYER_NAME);
    showLayer(CONSTANTS.STATUS_LAYER_NAME);
    await loadCostsLayer();
    //hide the results layer, feature layer, and feature puid layers
    hideLayer(CONSTANTS.RESULTS_LAYER_NAME);
    showHideLayerTypes(
      [
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ],
      false
    );
    //render the planning units status layer_edit layer
    renderPuEditLayer(CONSTANTS.STATUS_LAYER_NAME);
  };

  //fired whenever another tab is selected
  const setPUTabInactive = () => {
    //show the results layer, eature layer, and feature puid layers
    showLayer(CONSTANTS.RESULTS_LAYER_NAME);
    showHideLayerTypes(
      [
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ],
      true
    );
    //hide the planning units layer, edit layer, and cost layer
    hideLayer(CONSTANTS.PU_LAYER_NAME);
    hideLayer(CONSTANTS.STATUS_LAYER_NAME);
    hideLayer(CONSTANTS.COSTS_LAYER_NAME);
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // PLANNING UNITS AND WORKFLOW
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  const startPuEditSession = () => {
    //set the state
    setPuEditing(true);
    //set the cursor to a crosshair
    map.current.getCanvas().style.cursor = "crosshair";
    //add the left mouse click event to the planning unit layer
    this.onClickRef = moveStatusUp; //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    map.current.on("click", CONSTANTS.PU_LAYER_NAME, this.onClickRef);
    //add the mouse right click event to the planning unit layer
    this.onContextMenu = resetStatus; //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    map.current.on("contextmenu", CONSTANTS.PU_LAYER_NAME, this.onContextMenu);
  };

  const stopPuEditSession = () => {
    //set the state
    setPuEditing(false);
    //reset the cursor
    map.current.getCanvas().style.cursor = "pointer";
    //remove the mouse left click event
    map.current.off("click", CONSTANTS.PU_LAYER_NAME, onClickRef);
    //remove the mouse right click event
    map.current.off("contextmenu", CONSTANTS.PU_LAYER_NAME, onContextMenu);
    //update the pu.dat file
    updatePuDatFile();
  };

  //clears all of the manual edits from the pu edit layer (except the protected area units)
  const clearManualEdits = () => {
    // Clear all the planning unit statuses
    setPlanningUnits([]);
    // Get the puids for the current IUCN category
    const puids = getPuidsFromIucnCategory(metadata.IUCN_CATEGORY);
    // Update the planning units
    updatePlanningUnits([], puids);
  };

  //sends a list of puids that should be excluded from the run to upddate the pu.dat file
  const updatePuDatFile = async () => {
    //initialise the form data
    let formData = new FormData();
    formData.append("user", owner);
    formData.append("project", project);
    //add the planning unit manual exceptions
    if (planningUnits.length > 0) {
      planningUnits.forEach((item) =>
        formData.append(`status${item[0]}`, item[1])
      );
    }
    //post to the server
    await _post("updatePUFile", formData);
  };

  //fired when the user left clicks on a planning unit to move its status up
  const moveStatusUp = (e) => changeStatus(e, "up");

  //fired when the user left clicks on a planning unit to reset its status
  const resetStatus = (e) => changeStatus(e, "reset");

  const changeStatus = (e, direction) => {
    //get the feature that the user has clicked
    var features = getRenderedFeatures(e.point, [CONSTANTS.PU_LAYER_NAME]);
    //get the featureid
    if (features.length > 0) {
      //get the puid, its current status, and next status level
      const puid = features[0].properties.puid;
      const status = getStatusLevel(puid);
      const next_status = getNextStatusLevel(status, direction);
      //copy the current planning unit statuses
      const statuses = [...planningUnits];
      // If planning unit is not level 0 (in which case it will not be in the planningUnits state) - remove it from the puids array for that status
      if (status !== 0) removePuidFromArray(statuses, status, puid);
      //add it to the new status array
      if (next_status !== 0) addPuidToArray(statuses, next_status, puid);
      //set the state
      setPlanningUnits(statuses);
      //re-render the planning unit edit layer
      renderPuEditLayer();
    }
  };

  const getStatusLevel = (puid) => {
    //iterate through the planning unit statuses to see which status the clicked planning unit belongs to, i.e. 1, 2 or 3
    return (
      CONSTANTS.PLANNING_UNIT_STATUSES.find((status) =>
        getPlanningUnitsByStatus(status).includes(puid)
      ) || 0
    );
  };

  //gets the array index position for the passed status in the planningUnits state
  const getStatusPosition = (status) =>
    planningUnits.findIndex((item) => item[0] === status);

  //returns the planning units with a particular status, e.g. 1,2,3
  const getPlanningUnitsByStatus = (status) => {
    //get the position of the status items in the planningUnits
    let position = getStatusPosition(status);
    //get the array of planning units
    return position > -1 ? planningUnits[position][1] : [];
  };

  //returns the next status level for a planning unit depending on the direction
  const getNextStatusLevel = (status, direction) => {
    let nextStatus;
    switch (status) {
      case 0:
        nextStatus = direction === "up" ? 3 : 0;
        break;
      case 1: //no longer used
        nextStatus = direction === "up" ? 0 : 0;
        break;
      case 2:
        nextStatus = direction === "up" ? 0 : 0; //used to be 1 going down
        break;
      case 3:
        nextStatus = direction === "up" ? 2 : 0;
        break;
      default:
        break;
    }
    return nextStatus;
  };

  // removes in individual puid value from an array of puid statuses
  const removePuidFromArray = (statuses, status, puid) =>
    removePuidsFromArray(statuses, status, [puid]);

  const addPuidToArray = (statuses, status, puid) =>
    appPuidsToPlanningUnits(statuses, status, [puid]);

  //adds all the passed puids to the planningUnits state
  const appPuidsToPlanningUnits = (statuses, status, puids) => {
    //get the position of the status items in the planningUnits, i.e. the index
    const position = getStatusPosition(status);
    if (position === -1) {
      //create a new status and empty puid array
      statuses.push([status, []]);
    }
    // add the puids to the puid array ensuring that they are unique
    statuses[position][1] = Array.from(
      new Set(statuses[position][1].concat(puids))
    );
    return statuses;
  };

  //removes all the passed puids from the planningUnits state
  const removePuidsFromArray = (statuses, status, puids) => {
    //get the position of the status items in the planningUnits
    const position = getStatusPosition(status);
    if (position > -1) {
      let puidArray = statuses[position][1];
      let filteredArray = puidArray.filter((item) => puids.indexOf(item) < 0);
      statuses[position][1] = filteredArray;
      //if there are no more items in the puid array then remove it
      if (filteredArray.length === 0) statuses.splice(position, 1);
    }
    return statuses;
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // NEW PROJECT AND PU GRIDS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //previews the planning grid
  const previewPlanningGrid = (newPlanningGridMetadata) => {
    setPlanningGridMetadata(newPlanningGridMetadata);
    dispatch(
      togglePlanningGridDialog({
        dialogName: "planningGridDialogOpen",
        isOpen: true,
      })
    );
  };
  //creates a new planning grid unit
  const createNewPlanningUnitGrid = async (iso3, domain, areakm2, shape) => {
    startLogging();
    const message = await _ws(
      `createPlanningUnitGrid?iso3=${iso3}&domain=${domain}&areakm2=${areakm2}&shape=${shape}`,
      wsMessageCallback
    );
    await newPlanningGridCreated(message);
    setNewPlanningGridDialogOpen(false);
  };

  //creates a new planning grid unit
  const createNewMarinePlanningUnitGrid = async (
    filename,
    planningGridName,
    areakm2,
    shape
  ) => {
    startLogging();
    const message = await _ws(
      `createMarinePlanningUnitGrid?filename=${filename}&planningGridName=${planningGridName}&areakm2=${areakm2}&shape=${shape}`,
      wsMessageCallback
    );
    await newMarinePlanningGridCreated(message);
    dispatch(
      togglePlanningGridDialog({
        dialogName: "newMarinePlanningGridDialogOpen",
        isOpen: false,
      })
    );
  };

  //imports a zipped shapefile as a new planning grid
  const importPlanningUnitGrid = async (zipFilename, alias, description) => {
    try {
      startLogging();
      messageLogger({
        method: "importPlanningUnitGrid",
        status: "Started",
        info: "Importing planning grid..",
      });
      const response = await importZippedShapefileAsPu(
        zipFilename,
        alias,
        description
      );
      messageLogger({
        method: "importPlanningUnitGrid",
        status: "Finished",
        info: response.info,
      });
      await newPlanningGridCreated(response);
      dispatch(
        togglePlanningGridDialog({
          dialogName: "importPlanningGridDialogOpen",
          isOpen: false,
        })
      );
    } catch (error) {
      deletePlanningUnitGrid(alias, true);
      messageLogger({
        method: "importPlanningUnitGrid",
        status: "Finished",
        error: error,
      });
      throw error;
    }
  };

  //called when a new planning grid has been created
  const newPlanningGridCreated = async (response) => {
    await pollMapbox(response.uploadId);
    await getPlanningUnitGrids();
  };

  //deletes a planning unit grid
  const deletePlanningUnitGrid = async (feature_class_name, silent = false) => {
    if (silent) {
      //used to roll back failed imports of planning grids
      await deletePlanningGrid(feature_class_name, true);
    } else {
      //get a list of the projects for the planning grid
      const projects = await getProjectsForPlanningGrid(feature_class_name);
      //if the planning grid is not being used then delete it
      if (projects.length === 0) {
        await deletePlanningGrid(feature_class_name, false);
      } else {
        //show the projects list dialog
        showProjectListDialog(
          projects,
          "Failed to delete planning grid",
          "The planning grid is used in the following projects"
        );
      }
    }
  };

  //deletes a planning grid
  const deletePlanningGrid = async (feature_class_name, silent) => {
    const response = await _get(
      `deletePlanningUnitGrid?planning_grid_name=${feature_class_name}`
    );
    //update the planning unit grids
    await getPlanningUnitGrids();
    dispatch(setSnackbarMessage(response.info, silent));
  };

  //exports a planning grid to a zipped shapefile
  const exportPlanningGrid = async (feature_class_name) => {
    try {
      const response = await _get(
        `exportPlanningUnitGrid?name=${feature_class_name}`
      );
      return `${projectState.bpServer.endpoint}exports/${response.filename}`;
    } catch (error) {
      throw new Error("Failed to export planning grid");
    }
  };

  //gets a list of projects that use a particular planning grid
  const getProjectsForPlanningGrid = async (feature_class_name) =>
    await _get(
      `listProjectsForPlanningGrid?feature_class_name=${feature_class_name}`
    );

  const getCountries = async () => {
    const response = await _get("getCountries");
    setCountries(response.records);
  };

  //uploads the named feature class to mapbox on the server
  const uploadToMapBox = async (feature_class_name, mapbox_layer_name) => {
    try {
      const response = _get(
        `uploadTilesetToMapBox?feature_class_name=${feature_class_name}&mapbox_layer_name=${mapbox_layer_name}`,
        300000
      );
      setLoading(true);
      const poll = await pollMapbox(response.uploadid);
      return poll;
    } catch (error) {
      console.error();
      throw error;
    }
  };

  const pollStatus = async (uploadid) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/uploads/v1/${CONSTANTS.MAPBOX_USER}/${uploadid}?access_token=${registry.MBAT}`
      );
      const result = await response.json();

      if (result.complete) {
        messageLogger({ info: "Uploaded", status: "UploadComplete" });
        clearMapboxTimer(uploadid);
        return "Uploaded to Mapbox";
      }

      if (result.error) {
        const errorMsg = `Mapbox upload error: ${result.error}. See <a href='${CONSTANTS.ERRORS_PAGE}#mapbox-upload-error' target='blank'>here</a>`;
        messageLogger({ error: errorMsg, status: "UploadFailed" });
        dispatch(setSnackbarMessage(errorMsg));
        clearMapboxTimer(uploadid);
        throw new Error(result.error);
      }
    } catch (error) {
      setUploading(false);
      throw error;
    }
  };
  //polls mapbox to see when an upload has finished - returns as promise
  const pollMapbox = async (uploadid) => {
    setUploading(true);
    messageLogger({ info: "Uploading to Mapbox..", status: "Uploading" });

    if (uploadid === "0") {
      messageLogger({
        info: "Tileset already exists on Mapbox",
        status: "UploadComplete",
      });
      //reset state
      setUploading(false);
      return "Uploaded to Mapbox";
    }

    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        try {
          const result = await pollStatus();
          if (result) {
            resolve(result);
            clearInterval(timer);
          }
        } catch (error) {
          reject(error);
          clearInterval(timer);
        }
      }, 3000);

      timers.push({ uploadid, timer });
    });
  };
  //resets a timer for a mapbox upload poll
  const clearMapboxTimer = (uploadid) => {
    //clear the timer
    const timerToClear = timers.find((timer) => timer.uploadid === uploadid);
    clearInterval(timerToClear.timer);
    //remove the timer from the timers array
    timers = timers.filter((timer) => timer.uploadid !== uploadid);
    if (timers.length === 0) setUploading(false);
  };

  const openWelcomeDialog = () => {
    parseNotifications();
    setWelcomeDialogOpen(true);
  };

  const openFeaturesDialog = async (showClearSelectAll) => {
    // Refresh features list if we are using a hosted service (other users could have created/deleted items) and the project is not imported (only project features are shown)
    if (projectState.bpServer.system !== "Windows" && !metadata.OLDVERSION) {
      await refreshFeatures();
    }
    setAddingRemovingFeatures(showClearSelectAll);
    dispatch(
      toggleFeatureDialog({
        dialogName: "featuresDialogOpen",
        isOpen: true,
      })
    );
    if (showClearSelectAll) {
      getSelectedFeatureIds();
    }
  };

  const closeNewFeatureDialog = () => {
    dispatch(
      toggleFeatureDialog({ dialogName: "newFeatureDialogOpen", isOpen: false })
    );
    finaliseDigitising();
  };

  const openPlanningGridsDialog = async () => {
    //refresh planning grids if using a hosted service - other users could have created/deleted items
    if (projectState.bpServer.system !== "Windows") {
      await getPlanningUnitGrids();
    }
    dispatch(
      togglePlanningGridDialog({
        dialogName: "planningGridsDialogOpen",
        isOpen: true,
      })
    );
  };

  //used by the import wizard to import a users zipped shapefile as the planning units
  //the zipped shapefile has been uploaded to the MARXAN folder - it will be imported to PostGIS and a record will be entered in the metadata_planningUnits table
  const importZippedShapefileAsPu = async (zipname, alias, description) =>
    await _get(
      `importPlanningUnitGrid?filename=${zipname}&name=${alias}&description=${description}`
    );

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // CUMULATIVE IMPACT
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  const openAtlasLayersDialog = async () => {
    setLoading(true);
    if (atlasLayers.length < 1) {
      const data = await getAtlasLayers();
      setAtlasLayers(data);
      dispatch(
        toggleDialog({ dialogName: "atlasLayersDialogOpen", isOpen: true })
      );
      setLoading(false);
    } else {
      // Open the dialog if there is data already loaded
      dispatch(
        toggleDialog({ dialogName: "atlasLayersDialogOpen", isOpen: true })
      );
      setLoading(false);
    }
  };

  const openCumulativeImpactDialog = async () => {
    dispatch(
      toggleDialog({ dialogName: "cumulativeImpactDialogOpen", isOpen: true })
    );
    try {
      await getImpacts();
    } catch (e) {
      dispatch(setSnackbarMessage("no impacts found"));
    }
  };

  //makes a call to get the impacts from the server and returns them
  const getImpacts = async () => {
    const response = await _get("getAllImpacts");
    setAllImpacts(response.data);
  };

  const getOceanBaseMap = () => {
    map.current.addSource("Ocean Base", {
      type: "raster",
      tiles: [
        "http://atlas.marine.ie/mapserver/?map=C:/MapServer/apps/miatlas/AdministrativeUnits_wms.map&service=WMS&request=GetMap&format=image/png&transparent=true&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}",
      ],
      tileSize: 256,
    });
    map.current.addLayer({
      id: "Ocean Base",
      type: "raster",
      source: "Ocean Base",
      layout: {
        // make layer visible by default
        visibility: "none",
      },
    });
    // setDialogsState(prevState => ({ ...prevState, map: map });
  };

  const addSource = async (sourceName, tileUrl) => {
    map.current.addSource(sourceName, {
      type: "raster",
      tiles: [tileUrl],
      tileSize: 256,
    });
  };

  const addLayer = async (sourceName) => {
    map.current.addLayer({
      id: sourceName,
      type: "raster",
      source: sourceName,
      layout: {
        visibility: "none", // make layer invisible by default
      },
    });
  };

  const getAtlasLayers = async () => {
    try {
      const response = await fetch(
        projectState.bpServer.endpoint + "getAtlasLayers",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      const parsedData = data.map(JSON.parse);

      for (const layer of parsedData) {
        const sourceName = layer.layer;
        const tileUrl = `http://www.atlas-horizon2020.eu/gs/ows?layers=${sourceName}&service=WMS&request=GetMap&format=image/png&transparent=true&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}`;

        // Add the source and layer to the map
        await addSource(sourceName, tileUrl);
        await addLayer(sourceName);
      }

      return parsedData;
    } catch (error) {
      console.error("Failed to fetch and add Atlas layers:", error);
    }
  };

  const openImportedActivitesDialog = async () => {
    await getUploadedActivities();
    setImportedActivitiesDialogOpen(true);
  };

  const openCostsDialog = async () => {
    if (!allImpacts?.length) {
      await getImpacts();
    }
    setCostsDialogOpen(true);
  };

  const getUploadedActivities = async () => {
    const response = await _get("getUploadedActivities");
    setUploadedActivities(response.data);
  };

  const clearSelactedLayers = () => {
    const layers = [...selectedLayers];
    layers.forEach((layer) => updateSelectedLayers(layer));
    dispatch(
      toggleDialog({ dialogName: "atlasLayersDialogOpen", isOpen: false })
    );
  };

  const updateSelectedLayers = (layer) => {
    // Determine the new visibility
    const currentVisibility = map.current.getLayoutProperty(
      layer.layer,
      "visibility"
    );
    const newVisibility = currentVisibility === "visible" ? "none" : "visible";
    // Update the layer's visibility
    map.current.setLayoutProperty(layer.layer, "visibility", newVisibility);

    // Update the selectedLayers state

    setSelectedLayers((prevState) => {
      const isLayerSelected = prevState.includes(layer);

      return isLayerSelected
        ? prevState.filter((item) => item !== layer)
        : [...prevState, layer];
    });
  };

  //when a user clicks a impact in the ImpactsDialog
  const clickImpact = (impact, event, previousRow) => {
    selectedImpactIds.includes(impact.id)
      ? removeImpact(impact)
      : addImpact(impact);
    toggleImpactLayer(impact);
  };

  //adds a impact to the selectedImpactIds array
  const addImpact = (impact) =>
    setSelectedImpactIds((prevState) => [
      ...prevState.selectedImpactIds,
      impact.id,
    ]);

  //removes a impact from the selectedImpactIds array
  const removeImpact = (impact) => {
    setSelectedImpactIds((prevState) =>
      prevState.selectedImpactIds.filter((imp) => imp !== impact.id)
    );
  };

  //toggles the impact layer on the map
  const toggleImpactLayer = (impact) => {
    if (impact.tilesetid === "") {
      dispatch(
        setSnackbarMessage(
          `This impact does not have a tileset on Mapbox. See <a href='${CONSTANTS.ERRORS_PAGE}#the-tileset-from-source-source-was-not-found' target='blank'>here</a>`
        )
      );
      return;
    }
    // this.closeImpactMenu();
    const layerName = impact.tilesetid.split(".")[1];
    const layerId = "marxan_impact_layer_" + layerName;

    if (map.current.getLayer(layerId)) {
      removeMapLayer(layerId);
      map.current.removeSource(layerId);
      updateImpact(impact, { impact_layer_loaded: false });
    } else {
      //if a planning units layer for a impact is visible then we need to add the impact layer before it - first get the impact puid layer
      const layers = getLayers([
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ]);
      //get the before layer
      const beforeLayer = layers.length > 0 ? layers[0].id : "";
      const rasterLayer = {
        id: layerId,
        metadata: {
          name: impact.alias,
          type: "impact",
        },
        type: "raster",
        source: {
          type: "raster",
          tiles: [
            `https://api.mapbox.com/v4/${impact.tilesetid}/{z}/{x}/{y}.png256?access_token=pk.eyJ1IjoiY3JhaWNlcmphY2siLCJhIjoiY2syeXhoMjdjMDQ0NDNnbDk3aGZocWozYiJ9.T-XaC9hz24Gjjzpzu6RCzg`,
          ],
        },
        layout: {
          visibility: "visible",
        },
        "source-layer": layerName,
        paint: { "raster-opacity": 0.85 },
      };
      addMapLayer(rasterLayer, beforeLayer);
      updateImpact(impact, { impact_layer_loaded: true });
    }
  };

  //gets the ids of the selected impacts
  const getSelectedImpactIds = () => {
    // Use map and filter to get selected impact IDs in one line
    const ids = allImpacts
      .filter((impact) => impact.selected)
      .map((impact) => impact.id);

    // Update the state with the selected impact IDs
    setSelectedImpactIds(ids);
  };

  //updates the properties of a impact and then updates the impacts state
  const updateImpact = (impact, newProps) => {
    // Create a shallow copy of the impacts array
    const impacts = [...allImpacts];

    // Find the index of the impact to update
    const index = impacts.findIndex((element) => element.id === impact.id);

    if (index !== -1) {
      // Create a new impact object with updated properties
      impacts[index] = { ...impacts[index], ...newProps };

      // Update the state
      setAllImpacts(impacts);

      // Update projectImpacts based on the selected impacts
      setProjectImpacts(impacts.filter((item) => item.selected));
    }
  };

  const openHumanActivitiesDialog = async () => {
    if (activities.length < 1) {
      const response = await _get("getActivities");
      const data = await JSON.parse(response.data);
      setActivities(data);
    }
    setHumanActivitiesDialogOpen(true);
  };

  //create new impact from the created pressures
  const importImpacts = async (filename, selectedActivity, description) => {
    //start the logging
    setLoading(true);
    startLogging();

    const url = `runCumumlativeImpact?filename=${filename}&activity=${selectedActivity}&description=${description}`;
    const message = await _ws(url, wsMessageCallback);
    await pollMapbox(message.uploadId);
    setLoading(false);
    return "Cumulative Impact Layer uploaded";
  };

  const runCumulativeImpact = async (selectedUploadedActivityIds) => {
    setLoading(true);
    startLogging();

    await _ws(
      `runCumumlativeImpact?selectedIds=${selectedUploadedActivityIds}`,
      wsMessageCallback
    );
    setLoading(false);
    return "Cumulative Impact Layer uploaded";
  };

  const uploadRaster = async (data) => {
    setLoading(true);
    messageLogger({
      method: "uploadRaster",
      status: "In Progress",
      info: "Uploading Raster...",
    });
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    //the binary data for the file, the filename
    const response = await _post("uploadRaster", formData);
    return response;
  };

  const openActivitiesDialog = async () => {
    await getUploadedActivities();
    setActivitiesDialogOpen(true);
  };

  //create new impact from the created pressures
  const saveActivityToDb = async (filename, selectedActivity, description) => {
    //start the logging
    setLoading(true);
    startLogging();
    const url = `saveRaster?filename=${filename}&activity=${selectedActivity}&description=${description}`;
    await _ws(url, wsMessageCallback);
    setLoading(false);
    return "Raster saved to db";
  };

  const createCostsFromImpact = async (data) => {
    setLoading(true);
    startLogging();
    const url = `createCostsFromImpact?user=${owner}&project=${project}&pu_filename=${metadata.PLANNING_UNIT_NAME}&impact_filename=${data.feature_class_name}&impact_type=${data.alias}`;
    await _ws(url, wsMessageCallback);
    setLoading(false);
    addCost(data.alias);
    return "Costs created from Cumulative impact";
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // FEATURES
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //updates the properties of a feature and then updates the features state
  const updateFeature = (feature, newProps) => {
    let features = [...allFeatures];
    const index = features.findIndex((element) => element.id === feature.id);
    if (index !== -1) {
      features[index] = { ...features[index], ...newProps };
      setAllFeatures(features);
      setProjectFeatures(features.filter((item) => item.selected));
    }
  };

  //gets the ids of the selected features
  const getSelectedFeatureIds = () => {
    const selectedFeatureIds = allFeatures
      .filter((feature) => feature.selected)
      .map((feature) => feature.id);

    setSelectedFeatureIds(selectedFeatureIds);
  };

  //when a user clicks a feature in the FeaturesDialog
  const clickFeature = (feature) => {
    return [...selectedFeatureIds].includes(feature.id)
      ? removeFeature(feature)
      : addFeature(feature);
  };

  //removes a feature from the selectedFeatureIds array
  const removeFeature = (feature) => {
    const updatedFeatureIds = selectedFeatureIds.filter(
      (id) => id !== feature.id
    );
    setSelectedFeatureIds(updatedFeatureIds);
  };

  //adds a feature to the selectedFeatureIds array
  const addFeature = (feature) =>
    setSelectedFeatureIds((prevState) =>
      prevState.includes(feature.id) ? prevState : [...prevState, feature.id]
    );

  //starts a digitising session
  const initialiseDigitising = () => {
    // Show digitising controls if not already present, mapbox-gl-draw-cold + mapbox-gl-draw-hot
    if (!map.current.getSource("mapbox-gl-draw-cold"))
      map.current.addControl(mapboxDrawControls);
  };

  //finalises the digitising
  const finaliseDigitising = () =>
    map.current.removeControl(mapboxDrawControls);

  //called when the user has drawn a polygon on screen
  const polygonDrawn = (evt) => {
    //open the new feature dialog for the metadata
    setNewFeatureDialogOpen(true);
    //save the feature in a local variable
    this.digitisedFeatures = evt.features;
  };

  //selects all the features
  const selectAllFeatures = () =>
    setSelectedFeatureIds(allFeatures.map((feature) => feature.id));

  //updates the allFeatures to set the various properties based on which features have been selected in the FeaturesDialog or programmatically
  const updateSelectedFeatures = async () => {
    //delete the gap analysis as the features within the project have changed
    await deleteGapAnalysis();

    // Get the updated features
    let updatedFeatures = allFeatures.map((feature) => {
      if (selectedFeatureIds.includes(feature.id)) {
        // Feature is selected
        return { ...feature, selected: true };
      } else {
        if (feature.feature_layer_loaded) toggleFeatureLayer(feature);
        if (feature.feature_puid_layer_loaded) toggleFeaturePUIDLayer(feature);
        // Feature is not selected
        if (metadata.OLDVERSION) {
          // For imported projects, only update selection status
          return { ...feature, selected: false };
        } else {
          // For non-old version features, set additional properties
          return {
            ...feature,
            selected: false,
            preprocessed: false,
            protected_area: -1,
            pu_area: -1,
            pu_count: -1,
            target_area: -1,
            occurs_in_planning_grid: false,
          };
        }
      }
    });

    // Apply updates to state
    setAllFeatures(updatedFeatures);
    setProjectFeatures(updatedFeatures.filter((item) => item.selected));
    // Persist changes to the server if the user is not read-only
    if (userData.ROLE !== "ReadOnly") {
      await updateSpecFile();
    }

    // Close dialogs
    dispatch(
      toggleFeatureDialog({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
  };

  //updates the target values for all features in the project to the passed value
  const updateTargetValueForFeatures = async (target_value) => {
    const features = allFeatures.map((feature) => ({
      ...feature,
      target_value,
    }));

    // Set the features in app state
    setAllFeatures(features);
    setProjectFeatures(features.filter((item) => item.selected));
    // Persist the changes to the server
    if (userData.ROLE !== "ReadOnly") {
      await updateSpecFile();
    }
  };

  //unselects a single Conservation feature
  const unselectItem = async (feature) => {
    removeFeature(feature);
    await updateSelectedFeatures();
  };

  //previews the feature
  const previewFeature = (featureMetadata) => {
    setFeatureMetadata(featureMetadata);
    setFeatureDialogOpen(true);
  };

  //unzips a shapefile on the server
  const unzipShapefile = async (filename) =>
    await _get(`unzipShapefile?filename=${filename}`);

  //deletes a zip file and shapefile (with the *.shp extension)
  const deleteShapefile = async (zipfile, shapefile) =>
    await _get(`deleteShapefile?zipfile=${zipfile}&shapefile=${shapefile}`);

  //gets a list of fieldnames from the passed shapefile - this must exist in the servers root directory
  const getShapefileFieldnames = async (filename) =>
    await _get(`getShapefileFieldnames?filename=${filename}`);

  //create new features from the already uploaded zipped shapefile
  const importFeatures = async (
    zipfile,
    name,
    description,
    shapefile,
    spiltfield
  ) => {
    //start the logging
    startLogging();
    const baseUrl = `importFeatures?zipfile=${zipfile}&shapefile=${shapefile}`;
    const url =
      name !== ""
        ? `${baseUrl}&name=${name}&description=${description}`
        : `${baseUrl}&splitfield=${splitfield}`;

    const message = await _ws(url, wsMessageCallback);
    //get the uploadIds, get a promise array to see when all of the uploads are done
    const promiseArray = message.uploadIds.map((uploadId) =>
      pollMapbox(uploadId)
    );

    await Promise.all(promiseArray);
    return "All features uploaded";
  };

  //imports features from a web resource
  const importFeaturesFromWeb = async (
    name,
    description,
    endpoint,
    srs,
    featureType
  ) => {
    startLogging();
    const url = `createFeaturesFromWFS?name=${name}&description=${description}&endpoint=${endpoint}&srs=${srs}&featuretype=${featureType}`;

    const message = await _ws(url, wsMessageCallback);
    const uploadId = message.uploadId;
    return await pollMapbox(uploadId);
  };

  //create the new feature from the feature that has been digitised on the map
  const createNewFeature = async (name, description) => {
    startLogging();
    messageLogger({
      method: "createNewFeature",
      status: "Started",
      info: "Creating feature..",
    });
    //post the geometry to the server with the metadata
    let formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    //convert the coordinates into a linestring to create the polygon in postgis
    let coords = this.digitisedFeatures[0].geometry.coordinates[0]
      .map((coordinate) => coordinate[0] + " " + coordinate[1])
      .join(",");

    formData.append("linestring", "Linestring(" + coords + ")");
    const response = await _post("createFeatureFromLinestring", formData);
    messageLogger({
      method: "createNewFeature",
      status: "Finished",
      info: response.info,
    });
    const mbResponse = await pollMapbox(response.uploadId);
    await newFeatureCreated(mbResponse.id);
    closeNewFeatureDialog();
  };

  //gets the new feature information and updates the state
  const newFeatureCreated = async (id) => {
    const response = await _get(`getFeature?oid=${id}&format=json`);
    const feature = response.data[0];
    addFeatureAttributes(feature);
    addNewFeature([feature]);

    // If 'addToProject' is set, add the feature to the project
    if (addToProject) {
      addFeature(feature);
      await updateSelectedFeatures();
    }
  };

  //adds a new feature to the allFeatures array
  const addNewFeature = (newFeatures) => {
    setAllFeatures((prevFeatures) => {
      const featuresCopy = [...prevFeatures, ...newFeatures];
      featuresCopy.sort((a, b) =>
        a.alias.localeCompare(b.alias, undefined, { sensitivity: "base" })
      );
      return featuresCopy;
    });
  };

  //attempts to delete a feature - if the feature is in use in a project then it will not be deleted and the list of projects will be shown
  const deleteFeature = async (feature) => {
    try {
      // Fetch projects associated with the feature
      const projects = await getProjectsForFeature(feature);

      // Check if there are any projects using the feature
      if (projects.length === 0) {
        // No projects using the feature, proceed with deletion
        await _deleteFeature(feature);
      } else {
        // Projects using the feature, show dialog to the user
        showProjectListDialog(
          projects,
          "Failed to delete planning feature",
          "The feature is used in the following projects"
        );
      }
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error deleting feature:", error);
      // Optionally: show error feedback to the user
      dispatch(setSnackbarMessage("Failed to delete feature due to an error."));
    }
  };

  //deletes a feature
  const _deleteFeature = async (feature) => {
    const response = await _get(
      `deleteFeature?feature_name=${feature.feature_class_name}`
    );
    dispatch(setSnackbarMessage("Feature deleted"));
    removeFeature(feature);
    removeFeatureFromAllFeatures(feature); //remove it from the allFeatures array
  };

  //removes a feature from the allFeatures array
  const removeFeatureFromAllFeatures = (feature) => {
    const updatedFeatures = allFeatures.filter(
      (item) => item.id !== feature.id
    );
    setAllFeatures(updatedFeatures);
  };

  //gets the feature ids as a set from the allFeatures array
  const getFeatureIds = (_features) =>
    new Set(_features.map((item) => item.id));

  //refreshes the allFeatures state
  const refreshFeatures = async () => {
    // Fetch the latest features
    const response = await _get("getAllSpeciesData");
    const newFeatures = response.data;

    // Extract existing and new feature IDs
    const existingFeatureIds = getFeatureIds(allFeatures);
    const newFeatureIds = getFeatureIds(newFeatures);

    // Determine which features have been removed or added
    const removedFeatureIds = [...existingFeatureIds].filter(
      (id) => !newFeatureIds.has(id)
    );
    const addedFeatureIds = [...newFeatureIds].filter(
      (id) => !existingFeatureIds.has(id)
    );

    // Remove features that are no longer present
    removedFeatureIds.forEach((id) => removeFeatureFromAllFeatures({ id }));

    // Initialize new features
    const addedFeatures = newFeatures.filter((feature) =>
      addedFeatureIds.includes(feature.id)
    );
    const updatedFeatures = addedFeatures.map((feature) =>
      addFeatureAttributes(feature)
    );
    addNewFeature(updatedFeatures);
  };

  const openFeatureMenu = (evt, feature) => {
    setCurrentFeature(feature);
    setMenuAnchor(evt.currentTarget);
    setFeatureMenuOpen(true);
  };

  //hides the feature layer
  const hideFeatureLayer = () => {
    projectFeatures.forEach((feature) => {
      if (feature.feature_layer_loaded) toggleFeatureLayer(feature);
    });
  };

  //toggles the feature layer on the map
  const toggleFeatureLayer = (feature) => {
    if (feature.tilesetid === "") {
      dispatch(
        setSnackbarMessage(
          `This feature does not have a tileset on Mapbox. See <a href='${CONSTANTS.ERRORS_PAGE} #the-tileset-from-source-source-was-not-found' target='blank'>here</a>`
        )
      );
      return;
    }
    // setFeatureMenuOpen(false);
    const layerId = `marxan_feature_layer_${feature.tilesetid.split(".")[1]}`;

    if (map.current.getLayer(layerId)) {
      removeMapLayer(layerId);
      map.current.removeSource(layerId);
      updateFeature(feature, { feature_layer_loaded: false });
    } else {
      // If a planning units layer for a feature is visible then we need to add the feature layer before it - first get the feature puid layer
      const layers = getLayers([
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ]);
      let beforeLayer = layers.length > 0 ? layers[0].id : "";
      const paintProperty = getPaintProperty(feature);
      const typeProperty = getTypeProperty(feature);
      addMapLayer(
        {
          id: layerId,
          metadata: {
            name: feature.alias,
            type: CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
          },
          type: typeProperty,
          source: {
            type: "vector",
            url: "mapbox://" + feature.tilesetid,
          },
          layout: {
            visibility: "visible",
          },
          "source-layer": layerName,
          paint: paintProperty,
        },
        beforeLayer
      ); //add it before the layer that shows the planning unit outlines for the feature
      updateFeature(feature, { feature_layer_loaded: true });
    }
  };

  //toggles the planning unit feature layer on the map
  const toggleFeaturePUIDLayer = async (feature) => {
    // setFeatureMenuOpen(false);
    let layerName = `marxan_puid_${feature.id}`;

    if (current.getLayer(layerName)) {
      removeMapLayer(layerName);
      updateFeature(feature, { feature_puid_layer_loaded: false });
    } else {
      //get the planning units where the feature occurs
      const response = await _get(
        `getFeaturePlanningUnits?user=${owner}&project=${project}&oid=${feature.id}`
      );

      addMapLayer({
        id: layerName,
        metadata: {
          name: feature.alias,
          type: CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
          lineColor: feature.color,
        },
        type: "line",
        source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
        "source-layer": tileset.name,
        layout: {
          visibility: "visible",
        },
        paint: {
          "line-opacity": CONSTANTS.FEATURE_PLANNING_GRID_LAYER_OPACITY,
        },
      });
      //update the paint property for the layer
      const line_color_expression = initialiseFillColorExpression("puid");

      response.data.forEach((puid) =>
        line_color_expression.push(puid, feature.color)
      );
      // Last value is the default, used where there is no data
      line_color_expression.push("rgba(0,0,0,0)");
      map.current.setPaintProperty(
        layerName,
        "line-color",
        line_color_expression
      );
      //show the layer
      showLayer(layerName);
      updateFeature(feature, { feature_puid_layer_loaded: true });
    }
  };

  //removes the current feature from the project
  const removeFromProject = (feature) => {
    setFeatureMenuOpen(false);
    unselectItem(feature);
  };

  //zooms to a features extent
  const zoomToFeature = (feature) => {
    setFeatureMenuOpen(false);
    //transform from BOX(-174.173506487 -18.788241791,-173.86528589 -18.5190063499999) to [[-73.9876, 40.7661], [-73.9397, 40.8002]]
    const points = feature.extent
      .substr(4, feature.extent.length - 5)
      .replace(/ /g, ",")
      .split(",");
    //get the points as numbers
    const nums = points.map((item) => Number(item));
    map.current.fitBounds(
      [
        [nums[0], nums[1]],
        [nums[2], nums[3]],
      ],
      { padding: 100 }
    );
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // DIALOGS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  const openProjectsDialog = async () => {
    await getProjects();
    dispatch(
      toggleProjectDialog({ dialogName: "projectsDialogOpen", isOpen: true })
    );
  };

  const openNewProjectWizardDialog = async () => {
    await getCountries();
    dispatch(
      toggleProjectDialog({
        dialogName: "newPlanningGridDialogOpen",
        isOpen: true,
      })
    );
  };

  const openNewPlanningGridDialog = async () => {
    await getCountries();
    dispatch(
      togglePlanningGridDialog({
        dialogName: "newPlanningGridDialogOpen",
        isOpen: true,
      })
    );
  };

  const openUsersDialog = async () => {
    await getUsers();
    setUsersDialogOpen(true);
  };

  const openRunLogDialog = async () => {
    await getRunLogs();
    await startPollingRunLogs();
    setRunLogDialogOpen(true);
  };

  const openGapAnalysisDialog = async () => {
    dispatch(
      toggleDialog({ dialogName: "gapAnalysisDialogOpen", isOpen: true })
    );
    setGapAnalysis([]);
    return await runGapAnalysis();
  };

  const showProjectListDialog = (
    projectList,
    projectListDialogTitle,
    projectListDialogHeading
  ) => {
    setProjectList(projectList);
    setProjectListDialogHeading(projectListDialogHeading);
    setProjectListDialogTitle(projectListDialogTitle);
    dispatch(
      toggleProjectDialog({
        dialogName: "projectsListDialogOpen",
        isOpen: true,
      })
    );
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // PROTECTED AREAS LAYERS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  const changeIucnCategory = async (iucnCategory) => {
    setMetadata((prevState) => ({
      ...prevState.metadata,
      IUCN_CATEGORY: iucnCategory,
    }));
    //update the input.dat file
    await updateProjectParameter("IUCN_CATEGORY", iucnCategory);
    // Render the wdpa intersections on the grid
    await renderPAGridIntersections(iucnCategory);
  };

  const filterWdpaByIucnCategory = (iucnCategory) => {
    //get the individual iucn categories
    const iucnCategories = getIndividualIucnCategories(iucnCategory);
    //TODO FILTER THE WDPA CLIENT SIDE BY INTERSECTING IT WITH THE PLANNING GRID
    //filter the vector tiles for those iucn categories - and if the planning unit name has an iso3 country code - then use that as well. e.g. pu_ton_marine_hexagon_50 (has iso3 code) or pu_a4402723a92444ff829e9411f07e7 (no iso3 code)
    //let filterExpr = (metadata.PLANNING_UNIT_NAME.match(/_/g).length> 1) ? ['all', ['in', 'IUCN_CAT'].concat(iucnCategories), ['==', 'PARENT_ISO', metadata.PLANNING_UNIT_NAME.substr(3, 3).toUpperCase()]] : ['all', ['in', 'IUCN_CAT'].concat(iucnCategories)];
    const filterExpr = ["all", ["in", "iucn_cat", ...iucnCategories]]; // no longer filter by ISO code
    map.current.setFilter(CONSTANTS.WDPA_LAYER_NAME, filterExpr);

    // Turn on/off the protected areas legend
    const layerVisible = iucnCategory !== "None";
    setPaLayerVisible(layerVisible);
  };

  const getIndividualIucnCategories = (iucnCategory) => {
    const categoryMap = {
      None: [""],
      "IUCN I-II": ["Ia", "Ib", "II"],
      "IUCN I-IV": ["Ia", "Ib", "II", "III", "IV"],
      "IUCN I-V": ["Ia", "Ib", "II", "III", "IV", "V"],
      "IUCN I-VI": ["Ia", "Ib", "II", "III", "IV", "V", "VI"],
      All: [
        "Ia",
        "Ib",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "Not Reported",
        "Not Applicable",
        "Not Assigned",
      ],
    };

    return categoryMap[iucnCategory] || [];
  };

  //gets the puids for those protected areas that intersect the planning grid in the passed iucn category
  const getPuidsFromIucnCategory = (iucnCategory) => {
    const intersections_by_category = getIntersections(iucnCategory);
    //get all the puids in this iucn category
    return intersections_by_category.flatMap((item) => item[1]);
  };

  //called when the iucn category changes - gets the puids that need to be added/removed, adds/removes them and updates the PuEdit layer
  const renderPAGridIntersections = async (iucnCategory) => {
    await preprocessProtectedAreas(iucnCategory);
    let puids = getPuidsFromIucnCategory(iucnCategory);
    //see if any of them will overwrite existing manually edited planning units - these will be in status 1 and 3
    const manuallyEditedPuids = getPlanningUnitsByStatus(1).concat(
      getPlanningUnitsByStatus(3)
    );
    const clashingPuids = manuallyEditedPuids.filter(
      (value) => -1 !== puids.indexOf(value)
    );
    if (clashingPuids.length > 0) {
      //remove them from the puids
      puids = puids.filter((item) => !clashingPuids.includes(item));
      dispatch(
        setSnackbarMessage(
          `Not all planning units have been added. See <a href='${CONSTANTS.ERRORS_PAGE}#not-all-planning-units-have-been-added' target='blank'>here</a>`
        )
      );
    }
    // Get all puids for existing iucn category - these will come from the previousPuids rather than getPuidsFromIucnCategory as there may have been some clashes and not all of the puids from getPuidsFromIucnCategory may actually be renderered
    //if the previousPuids are undefined then get them from the projects previousIucnCategory
    let previousPuids =
      this.previousPuids !== undefined
        ? this.previousPuids
        : getPuidsFromIucnCategory(previousIucnCategory);
    //set the previously selected puids
    this.previousPuids = puids;
    //and previousIucnCategory
    setPreviousIucnCategory(iucnCategory);
    //rerender
    updatePlanningUnits(previousPuids, puids);
  };

  //updates the planning units by reconciling the passed arrays of puids
  const updatePlanningUnits = async (previousPuids, puids) => {
    //copy the current planning units state
    const statuses = [...planningUnits];
    //get the new puids that need to be added
    const newPuids = getNewPuids(previousPuids, puids);
    if (newPuids.length === 0) {
      //get the puids that need to be removed
      let oldPuids = getNewPuids(puids, previousPuids);
      removePuidsFromArray(statuses, 2, oldPuids);
    } else {
      //add all the new protected area intersections into the planning units as status 2
      appPuidsToPlanningUnits(statuses, 2, newPuids);
    }
    //update the state
    setPlanningUnits(statuses);
    //re-render the layer
    renderPuEditLayer();
    //update the pu.dat file
    await updatePuDatFile();
  };

  const getNewPuids = (previousPuids, puids) =>
    puids.filter((i) => previousPuids.indexOf(i) === -1);

  const preprocessProtectedAreas = async (iucnCategory) => {
    // Have the intersections already been calculated
    if (protectedAreaIntersections.length > 0) {
      return protectedAreaIntersections;
    } else {
      try {
        // Start logging
        startLogging();

        // Call the websocket
        const message = await _ws(
          `preprocessProtectedAreas?user=${owner}&project=${project}&planning_grid_name=${metadata.PLANNING_UNIT_NAME}`,
          wsMessageCallback
        );
        setProtectedAreaIntersections(message.intersections);
        return message.intersections;
      } catch (error) {
        throw error;
      }
    }
  };

  const getIntersections = (iucnCategory) => {
    //get the individual iucn categories
    const _iucn_categories = getIndividualIucnCategories(iucnCategory);
    //get the planning units that intersect the protected areas with the passed iucn category
    return protectedAreaIntersections.filter(
      (item) => _iucn_categories.indexOf(item[0]) > -1
    );
  };

  //downloads and updates the WDPA on the server
  const updateWDPA = async () => {
    startLogging();
    //call the webservice
    const message = await _ws(
      `updateWDPA?downloadUrl=${registry.WDPA.downloadUrl}&wdpaVersion=${registry.WDPA.latest_version}`,
      wsMessageCallback
    );
    // Websocket has finished - set the new version of the wdpa

    setNewWDPAVersion(false);
    setBpServer({
      ...prev,
      wdpa_version: registry.WDPA.latest_version,
    });
    await delay(1000);
    //set the source for the WDPA layer to the new vector tiles
    setWDPAVectorTilesLayerName(registry.WDPA.latest_version);
    // Remove the existing WDPA layer and source
    removeMapLayer(CONSTANTS.WDPA_LAYER_NAME);
    if (map.current && map.current.getSource(CONSTANTS.WDPA_SOURCE_NAME)) {
      map.current.removeSource(CONSTANTS.WDPA_SOURCE_NAME);
    }
    //re-add the WDPA source and layer
    addWDPASource();
    addWDPALayer();
    //reset the protected area intersections on the client
    setProtectedAreaIntersections([]);
    //recalculate the protected area intersections and refilter the vector tiles
    await changeIucnCategory(metadata.IUCN_CATEGORY);
    //close the dialog
    dispatch(
      toggleDialog({ dialogName: "updateWDPADialogOpen", isOpen: false })
    );
    return message;
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // BOUNDARY LENGTH AND CLUMPING
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  const preprocessBoundaryLengths = async (iucnCategory) => {
    if (files.BOUNDNAME) {
      // If the bounds.dat file already exists, exit the function
      return;
    }

    try {
      // Start logging
      startLogging();

      // Call the websocket and wait for the response
      const message = await _ws(
        `preprocessPlanningUnits?user=${owner}&project=${project}`,
        wsMessageCallback
      );

      // Update the state with the new file name
      setFiles((prevState) => ({ ...prevState, BOUNDNAME: "bounds.dat" }));

      // Return the message from the websocket
      return message;
    } catch (error) {
      // Handle any errors that occurred during the websocket call
      console.error("Error preprocessing boundary lengths:", error);
      throw error; // Re-throw the error if needed
    }
  };

  const showClumpingDialog = async () => {
    // Update the map centre and zoom state which is used by the maps in the clumping dialog
    updateMapCentreAndZoom();
    //when the boundary lengths have been calculated
    await preprocessBoundaryLengths();
    // Update the spec.dat file with any that have been added or removed or changed target or spf
    await updateSpecFile();
    // When the species file has been updated, update the planning unit file
    updatePuFile(); // not implemented yet

    // When the planning unit file has been updated, update the PuVSpr file - this does all the preprocessing using web sockets
    await updatePuvsprFile();
    //show the clumping dialog
    setClumpingDialogOpen(true);
    setClumpingRunning(true);
  };

  const hideClumpingDialog = async () => {
    //delete the project group
    await deleteProjects();
    //reset the paint properties in the clumping dialog
    resetPaintProperties();
    //return state to normal
    dispatch(toggleDialog({ dialogName: "clumpingDialogOpen", isOpen: false }));
  };

  //creates a group of 5 projects with UUIDs in the _clumping folder
  const createProjectGroupAndRun = async (blmValues) => {
    //clear any exists projects
    let _projects = undefined;
    if (_projects) {
      await deleteProjects();
    }
    const response = await _get(
      `createProjectGroup?user=${owner}&project=${project}&copies=5&blmValues=${blmValues.join(
        ","
      )}`
    );
    // Set the local variable for the projects
    _projects = response.data;
    //run the projects
    await runProjects(response.data);
    return "Project group created";
  };

  //deletes the projects from the _clumping folder
  const deleteProjects = async () => {
    if (this.projects) {
      const projectNames = this.projects.map((item) => item.projectName);
      //clear the local variable
      this.projects = undefined;
      try {
        await _get(`deleteProjects?projectNames=${projectNames.join(",")}`);
        return "Projects deleted";
      } catch (error) {
        throw error;
      }
    }
  };

  const runProjects = async (projects) => {
    //reset the counter
    this.projectsRun = 0;
    //set the intitial state
    setClumpingRunning(true);
    // Iterate through projects using a for...of loop to handle async/await correctly
    try {
      for (const proj of projects) {
        // Start the Marxan job and wait for the response
        const response = await startMarxanJob(
          "_clumping",
          proj.projectName,
          false
        );

        // Check for errors and proceed if no errors are found
        if (!this.checkForErrors(response, false)) {
          // Run completed - get a single solution
          await loadOtherSolution(response.user, response.project, 1);
        }

        // Increment the project counter
        this.projectsRun += 1;

        // Update the state when the counter reaches 5
        if (this.projectsRun === 5) {
          setClumpingRunning(false);
        }
      }
    } catch (error) {
      // Handle errors if any occur during the process
      console.error("An error occurred while running projects:", error);
    }
  };

  const rerunProjects = async (blmChanged, blmValues) => {
    //reset the paint properties in the clumping dialog
    resetPaintProperties();
    //if the blmValues have changed then recreate the project group and run
    if (blmChanged) {
      await createProjectGroupAndRun(blmValues);
    } else {
      //rerun the projects
      await runProjects(this.projects);
    }
  };

  const setBlmValue = async (blmValue) => {
    const newRunParams = runParams.map((item) => ({
      key: item.key,
      value: item.key === "BLM" ? String(blmValue) : item.value,
    }));

    // Update the run parameters
    return await updateRunParams(newRunParams);
  };

  const resetPaintProperties = () => {
    //reset the paint properties
    setMapPaintProperties({
      mapPP0: [],
      mapPP1: [],
      mapPP2: [],
      mapPP3: [],
      mapPP4: [],
    });
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // MANAGING RUNS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //called when the run log dialog opens and starts polling the run log
  const startPollingRunLogs = async () => {
    // Function to handle the polling
    const pollLogs = async () => {
      try {
        await getRunLogs();
      } catch (error) {
        console.error("Error fetching run logs:", error);
      }
    };

    // Start polling at a set interval
    setRunlogTimer(setInterval(pollLogs, 5000));
  };

  //returns the log of all of the runs from the server
  const getRunLogs = async () => {
    if (!unauthorisedMethods.includes("getRunLogs")) {
      const response = await _get("getRunLogs");
      setRunLogs(response.data);
    }
  };

  //clears the records from the run logs file
  const clearRunLogs = async () => {
    await _get("clearRunLogs");
    await getRunLogs();
  };

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // GAP ANALYSIS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  const runGapAnalysis = async () => {
    setActiveTab("log");
    const message = await _ws(
      `runGapAnalysis?user=${owner}&project=${project}`,
      wsMessageCallback
    );
    setGapAnalysis(message.data);
    return message;
  };

  //deletes a stored gap analysis on the server
  const deleteGapAnalysis = async () =>
    await _get(`deleteGapAnalysis?user=${owner}&project=${project}`);

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // COSTSy
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //

  //changes the cost profile for a project
  const changeCostname = async (costname) => {
    await _get(
      `updateCosts?user=${owner}&project=${project}&costname=${costname}`
    );
    setMetadata((prevState) => ({
      ...prevState.metadata,
      COSTS: costname,
    }));
  };

  //loads the costs layer
  const loadCostsLayer = async (forceReload = false) => {
    setCostsLoading(true);
    const response = await getPlanningUnitsCostData(forceReload);
    setCostData(response);
    renderPuCostLayer(response);
    setCostsLoading(false);
  };

  //gets the cost data either from cache (if it has already been loaded) or from the server
  const getPlanningUnitsCostData = async (forceReload) => {
    if (owner === "") {
      setOwner(user);
    }
    const url = `getPlanningUnitsCostData?user=${owner}&project=${project}`;
    try {
      // If cost data is already loaded and reload is not forced
      if (costData && !forceReload) {
        return costData;
      }

      // Fetch the cost data if not already loaded or force reload is requested
      const response = await _get(url);
      // Save the cost data to a local variable
      setCostData(response);
      return response;
    } catch (error) {
      // Handle the error (this can be customized based on your requirements)
      console.error("Error loading planning units cost data:", error);
      throw error; // Re-throw the error if further handling is needed
    }
  };

  //after clicking cancel in the ImportCostsDialog
  const deleteCostFileThenClose = async (costname) => {
    if (costname) {
      await deleteCost(costname);
      dispatch(
        toggleDialog({
          dialogName: "importCostsDialogOpen",
          isOpen: true,
        })
      );
    }
    return;
  };
  //adds a cost in application state
  const addCost = (costname) =>
    setCostnames((prevState) => [...prevState, costname]);

  //deletes a cost file on the server
  const deleteCost = async (costname) => {
    await _get(
      `deleteCost?user=${owner}&project=${project}&costname=${costname}`
    );
    const _costnames = costnames.filter((item) => item !== costname);
    setCostnames(_costnames);
    return;
  };
  //restores the database back to its original state and runs a git reset on the file system
  const resetServer = async () => {
    setActiveTab("log");
    await _ws("resetDatabase", wsMessageCallback);
    dispatch(toggleDialog({ dialogName: "resetDialogOpen", isOpen: false }));
    return;
  };

  //cleans up the server - removes dissolved WDPA feature classes, deletes orphaned feature classes, scratch feature classes and clumping files
  const cleanup = async () => {
    return await _get("cleanup?");
  };

  const handleProjectsDialogCancel = () =>
    dispatch(toggleDialog({ dialogName: "projectsDialogOpen", isOpen: false }));

  return (
    <div>
      {initialLoading ? (
        <Loading />
      ) : (
        <React.Fragment>
          <div
            ref={mapContainer}
            className="map-container absolute top right left bottom"
          />
          {loading ? <Loading /> : null}
          <LoginDialog
            open={!loggedIn}
            validateUser={(name, pass) => login(name, pass)}
            // onCancel={() => setRegisterDialogOpen(true)}
            loading={loading}
            user={user}
            password={password}
            changeUserName={(user) => setUser(user)}
            changePassword={(pass) => setPassword(pass)}
            marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
          />
          <ResendPasswordDialog
            open={dialogStates.resendPasswordDialogOpen}
            onOk={resendPassword}
            onCancel={() => setResendPasswordDialogOpen(false)}
            loading={loading}
            changeEmail={() => setResendEmail(value)}
            email={resendEmail}
          />
          <ToolsMenu
            menuAnchor={menuAnchor}
            openUsersDialog={openUsersDialog}
            openRunLogDialog={openRunLogDialog}
            openGapAnalysisDialog={openGapAnalysisDialog}
            userRole={userData.ROLE}
            metadata={metadata}
            cleanup={cleanup}
          />
          <UserMenu
            menuAnchor={menuAnchor}
            user={user}
            userRole={userData.ROLE}
            logout={logout}
          />
          <HelpMenu menuAnchor={menuAnchor} />
          <UserSettingsDialog
            open={dialogStates.userSettingsDialogOpen}
            onOk={() => setUserSettingsDialogOpen(false)}
            onCancel={() => setUserSettingsDialogOpen(false)}
            loading={loading}
            userData={userData}
            saveOptions={saveOptions}
            changeBasemap={setBasemap}
            basemaps={basemaps}
            basemap={basemap}
          />
          <UsersDialog
            open={dialogStates.usersDialogOpen}
            onOk={() => setUsersDialogOpen(false)}
            onCancel={() => setUsersDialogOpen(false)}
            loading={loading}
            user={user}
            users={users}
            deleteUser={handleDeleteUser}
            changeRole={changeRole}
            guestUserEnabled={projectState.bpServer.guestUserEnabled}
          />
          <ProfileDialog
            open={dialogStates.profileDialogOpen}
            onOk={() => setProfileDialogOpen(false)}
            onCancel={() => setProfileDialogOpen(false)}
            loading={loading}
            userData={userData}
            updateUser={handleUserUpdate}
          />
          <AboutDialog
            marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
            wdpaAttribution={wdpaAttribution}
          />
          <InfoPanel
            user={user}
            owner={owner}
            project={project}
            metadata={metadata}
            runMarxan={runMarxan}
            stopProcess={stopProcess}
            pid={pid}
            renameProject={renameProject}
            renameDescription={renameDescription}
            features={projectFeatures}
            setPUTabInactive={setPUTabInactive}
            setPUTabActive={setPUTabActive}
            startPuEditSession={startPuEditSession}
            stopPuEditSession={stopPuEditSession}
            puEditing={puEditing}
            clearManualEdits={clearManualEdits}
            openFeatureMenu={openFeatureMenu}
            preprocessing={preprocessing}
            openFeaturesDialog={openFeaturesDialog}
            changeIucnCategory={changeIucnCategory}
            updateFeature={updateFeature}
            userRole={userData.ROLE}
            toggleProjectPrivacy={toggleProjectPrivacy}
            getShareableLink={() => setShareableLinkDialogOpen(true)}
            toggleFeatureLayer={toggleFeatureLayer}
            toggleFeaturePUIDLayer={toggleFeaturePUIDLayer}
            useFeatureColors={userData.USEFEATURECOLORS}
            smallLinearGauge={smallLinearGauge}
            openCostsDialog={openCostsDialog}
            costname={metadata?.COSTS}
            costnames={costnames}
            changeCostname={changeCostname}
            loadCostsLayer={loadCostsLayer}
            loading={loading}
            // protectedAreaIntersections={protectedAreaIntersections}
          />
          <ResultsPanel
            open={resultsPanelOpen}
            preprocessing={preprocessing}
            solutions={solutions}
            loadSolution={loadSolution}
            setClassificationDialogOpen={() =>
              dispatch(
                toggleDialog({
                  dialogName: "classificationDialogOpen",
                  isOpen: true,
                })
              )
            }
            brew={brew}
            messages={logMessages}
            activeResultsTab={uiState.activeResultsTab}
            setActiveTab={setActiveTab}
            clearLog={() => setLogMessages([])}
            owner={owner}
            resultsLayer={resultsLayer}
            wdpaLayer={wdpaLayer}
            paLayerVisible={paLayerVisible}
            changeOpacity={changeOpacity}
            userRole={userData.ROLE}
            visibleLayers={visibleLayers}
            metadata={metadata}
            costsLoading={costsLoading}
          />
          <FeatureInfoDialog
            open={dialogStates.openInfoDialogOpen}
            onOk={() => setOpenInfoDialogOpen(false)}
            onCancel={() => setOpenInfoDialogOpen(false)}
            loading={loading}
            feature={currentFeature}
            updateFeature={updateFeature}
            userRole={userData.ROLE}
            reportUnits={userData.REPORTUNITS}
          />
          <IdentifyPopup
            visible={identifyVisible}
            xy={popupPoint}
            identifyPlanningUnits={identifyPlanningUnits}
            identifyProtectedAreas={identifyProtectedAreas}
            identifyFeatures={identifyFeatures}
            loading={loading}
            hideIdentifyPopup={hideIdentifyPopup}
            reportUnits={userData.REPORTUNITS}
            metadata={metadata}
          />
          <ProjectsDialog
            onCancel={() => handleProjectsDialogCancel()}
            project={project}
            loading={loading}
            projects={projects}
            oldVersion={metadata?.OLDVERSION}
            setProject={setProject}
            deleteProject={deleteProject}
            loadProject={loadProject}
            exportProject={exportProject}
            cloneProject={cloneProject}
            unauthorisedMethods={unauthorisedMethods}
            userRole={userData.ROLE}
            allFeatures={allFeatures}
          />
          <NewProjectDialog
            registry={registry}
            loading={loading}
            getPlanningUnitGrids={getPlanningUnitGrids}
            planningUnitGrids={planningUnitGrids}
            openFeaturesDialog={openFeaturesDialog}
            features={allFeatures}
            selectedCosts={selectedCosts}
            createNewProject={createNewProject}
            previewFeature={previewFeature}
          />
          <NewProjectWizardDialog
            okDisabled={true}
            countries={countries}
            createNewNationalProject={createNewNationalProject}
          />
          <NewPlanningGridDialog
            loading={loading || preprocessing || uploading}
            createNewPlanningUnitGrid={createNewPlanningUnitGrid}
            countries={countries}
          />
          <NewMarinePlanningGridDialog
            loading={loading || preprocessing || uploading}
            createNewPlanningUnitGrid={createNewMarinePlanningUnitGrid}
            fileUpload={uploadFileToFolder}
          />
          <ImportPlanningGridDialog
            importPlanningUnitGrid={importPlanningUnitGrid}
            loading={loading || uploading}
            fileUpload={uploadFileToFolder}
          />
          <FeaturesDialog
            onOk={updateSelectedFeatures}
            loading={loading || uploading}
            metadata={metadata}
            allFeatures={allFeatures}
            deleteFeature={deleteFeature}
            selectAllFeatures={selectAllFeatures}
            userRole={userData.ROLE}
            clickFeature={clickFeature}
            addingRemovingFeatures={addingRemovingFeatures}
            selectedFeatureIds={selectedFeatureIds}
            setSelectedFeatureIds={setSelectedFeatureIds}
            initialiseDigitising={initialiseDigitising}
            previewFeature={previewFeature}
            refreshFeatures={refreshFeatures}
          />
          <FeatureDialog
            loading={loading}
            featureMetadata={featureMetadata}
            getTilesetMetadata={getMetadata}
            reportUnits={userData.REPORTUNITS}
            getProjectList={getProjectList}
          />
          <NewFeatureDialog
            closeNewFeatureDialog={closeNewFeatureDialog}
            loading={loading || uploading}
            createNewFeature={createNewFeature}
            addToProject={addToProject}
            setAddToProject={setAddToProject}
          />
          <ImportFeaturesDialog
            importFeatures={importFeatures}
            loading={loading || preprocessing || uploading}
            filename={featureDatasetFilename}
            setFeatureDatasetFilename={setFeatureDatasetFilename}
            fileUpload={uploadFileToFolder}
            unzipShapefile={unzipShapefile}
            getShapefileFieldnames={getShapefileFieldnames}
            deleteShapefile={deleteShapefile}
            addToProject={addToProject}
            setAddToProject={setAddToProject}
          />
          <ImportFromWebDialog
            open={dialogStates.importFromWebDialogOpen}
            setImportFromWebDialogOpen={() =>
              dispatch(
                toggleDialog({
                  dialogName: "importFromWebDialogOpen",
                  isOpen: false,
                })
              )
            }
            loading={loading || preprocessing || uploading}
            importFeatures={importFeaturesFromWeb}
            addToProject={addToProject}
            setAddToProject={setAddToProject}
          />
          <PlanningGridsDialog
            loading={loading}
            getPlanningUnitGrids={getPlanningUnitGrids}
            unauthorisedMethods={unauthorisedMethods}
            planningGrids={planningUnitGrids}
            openNewPlanningGridDialog={openNewPlanningGridDialog}
            exportPlanningGrid={exportPlanningGrid}
            deletePlanningGrid={deletePlanningUnitGrid}
            previewPlanningGrid={previewPlanningGrid}
            fullWidth={true}
            maxWidth="false"
          />
          <PlanningGridDialog
            planningGridMetadata={planningGridMetadata}
            getTilesetMetadata={getMetadata}
            getProjectList={getProjectList}
          />
          <ProjectsListDialog
            projects={projectList}
            userRole={userData.ROLE}
            title={projectListDialogTitle}
            heading={projectListDialogHeading}
          />
          <CostsDialog
            unauthorisedMethods={unauthorisedMethods}
            costname={metadata?.COSTS}
            deleteCost={deleteCost}
            data={costnames}
            allImpacts={allImpacts}
            planningUnitName={metadata?.PLANNING_UNIT_NAME}
            createCostsFromImpact={createCostsFromImpact}
          />
          <ImportCostsDialog
            addCost={addCost}
            deleteCostFileThenClose={deleteCostFileThenClose}
            fileUpload={uploadFileToProject}
          />
          <RunSettingsDialog
            loading={loading || preprocessing}
            updateRunParams={updateRunParams}
            runParams={runParams}
            showClumpingDialog={showClumpingDialog}
            userRole={userData.ROLE}
          />
          {dialogStates.classificationDialogOpen ? (
            <ClassificationDialog
              open={dialogStates.classificationDialogOpen}
              onOk={() => setClassificationDialogOpen(false)}
              onCancel={() => setClassificationDialogOpen(false)}
              loading={loading}
              renderer={renderer}
              changeColorCode={changeColorCode}
              changeRenderer={changeRenderer}
              changeNumClasses={changeNumClasses}
              changeShowTopClasses={changeShowTopClasses}
              summaryStats={summaryStats}
              brew={brew}
              dataBreaks={dataBreaks}
            />
          ) : null}
          <ClumpingDialog
            hideClumpingDialog={hideClumpingDialog}
            tileset={tileset}
            setMapPaintProperties={setMapPaintProperties}
            mapPaintProperties={mapPaintProperties}
            mapCentre={mapCentre}
            mapZoom={mapZoom}
            createProjectGroupAndRun={createProjectGroupAndRun}
            rerunProjects={rerunProjects}
            setBlmValue={setBlmValue}
            clumpingRunning={clumpingRunning}
          />
          <ResetDialog onOk={resetServer} loading={loading} />
          <RunLogDialog
            loading={loading}
            preprocessing={preprocessing}
            unauthorisedMethods={unauthorisedMethods}
            runLogs={runLogs}
            getRunLogs={getRunLogs}
            clearRunLogs={clearRunLogs}
            stopMarxan={stopProcess}
            userRole={userData.ROLE}
            runlogTimer={runlogTimer}
          />
          <ServerDetailsDialog
            loading={loading}
            newWDPAVersion={newWDPAVersion}
            registry={registry}
          />
          <UpdateWDPADialog
            newWDPAVersion={newWDPAVersion}
            updateWDPA={updateWDPA}
            loading={preprocessing}
            registry={registry}
          />
          <AlertDialog />
          <Snackbar
            open={uiState.snackbarOpen}
            message={uiState.snackbarMessage}
            onClose={() => dispatch(setSnackbarOpen(false))}
            style={{ maxWidth: "800px !important" }}
          />
          <Popover
            open={featureMenuOpen}
            anchorEl={menuAnchor}
            onClose={() => setFeatureMenuOpen(false)}
            style={{ width: "307px" }}
          >
            <Menu
              style={{ width: "207px" }}
              onMouseLeave={() => setFeatureMenuOpen(false)}
              open={false}
            >
              <MenuItemWithButton
                leftIcon={<Properties style={{ margin: "1px" }} />}
                onClick={() => handleInfoMenuItemClick()}
              >
                Properties
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={<RemoveFromProject style={{ margin: "1px" }} />}
                style={{
                  display:
                    currentFeature?.old_version || userData.ROLE === "ReadOnly"
                      ? "none"
                      : "block",
                }}
                onClick={removeFromProject.bind(this, currentFeature)}
              >
                Remove from project
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={
                  currentFeature?.feature_layer_loaded ? (
                    <RemoveFromMap style={{ margin: "1px" }} />
                  ) : (
                    <AddToMap style={{ margin: "1px" }} />
                  )
                }
                style={{
                  display: currentFeature?.tilesetid ? "block" : "none",
                }}
                onClick={toggleFeatureLayer.bind(this, currentFeature)}
              >
                {currentFeature?.feature_layer_loaded
                  ? "Remove from map"
                  : "Add to map"}
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={
                  currentFeature?.feature_puid_layer_loaded ? (
                    <RemoveFromMap style={{ margin: "1px" }} />
                  ) : (
                    <AddToMap style={{ margin: "1px" }} />
                  )
                }
                onClick={toggleFeaturePUIDLayer.bind(this, currentFeature)}
                disabled={
                  !(
                    currentFeature?.preprocessed &&
                    currentFeature.occurs_in_planning_grid
                  )
                }
              >
                {currentFeature?.feature_puid_layer_loaded
                  ? "Remove planning unit outlines"
                  : "Outline planning units where the feature occurs"}
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={<ZoomIn style={{ margin: "1px" }} />}
                style={{
                  display: currentFeature?.extent ? "block" : "none",
                }}
                onClick={zoomToFeature.bind(this, currentFeature)}
              >
                Zoom to feature extent
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={<Preprocess style={{ margin: "1px" }} />}
                style={{
                  display:
                    currentFeature?.old_version || userData.ROLE === "ReadOnly"
                      ? "none"
                      : "block",
                }}
                onClick={preprocessSingleFeature.bind(this, currentFeature)}
                disabled={currentFeature?.preprocessed || preprocessing}
              >
                Pre-process
              </MenuItemWithButton>
            </Menu>
          </Popover>
          <TargetDialog
            showCancelButton={true}
            updateTargetValueForFeatures={updateTargetValueForFeatures}
          />
          <GapAnalysisDialog
            loading={loading}
            showCancelButton={true}
            setGapAnalysis={setGapAnalysis}
            gapAnalysis={gapAnalysis}
            preprocessing={preprocessing}
            projectFeatures={projectFeatures}
            metadata={metadata}
            reportUnits={userData.REPORTUNITS}
          />
          <ShareableLinkDialog
            shareableLinkUrl={`${window.location}?server=${projectState.bpServer.name}&user=${user}&project=${project}`}
          />
          {dialogStates.atlasLayersDialogOpen ? (
            <AtlasLayersDialog
              onCancel={clearSelactedLayers}
              loading={loading}
              atlasLayers={atlasLayers}
              selectedLayers={selectedLayers}
              updateSelectedLayers={updateSelectedLayers}
            />
          ) : null}

          <CumulativeImpactDialog
            loading={loading || uploading}
            openHumanActivitiesDialog={openHumanActivitiesDialog}
            metadata={metadata}
            allImpacts={allImpacts}
            clickImpact={clickImpact}
            initialiseDigitising={initialiseDigitising}
            selectedImpactIds={selectedImpactIds}
            openImportedActivitesDialog={openImportedActivitesDialog}
            userRole={userData.ROLE}
          />
          <HumanActivitiesDialog
            loading={loading || uploading}
            metadata={metadata}
            activities={activities}
            initialiseDigitising={initialiseDigitising}
            userRole={userData.ROLE}
            fileUpload={uploadRaster}
            saveActivityToDb={saveActivityToDb}
            openImportedActivitesDialog={openImportedActivitesDialog}
          />
          <RunCumuluativeImpactDialog
            loading={loading || uploading}
            metadata={metadata}
            uploadedActivities={uploadedActivities}
            userRole={userData.ROLE}
            runCumulativeImpact={runCumulativeImpact}
          />
          <MenuBar
            open={loggedIn}
            user={user}
            userRole={userData.ROLE}
            openProjectsDialog={openProjectsDialog}
            openActivitiesDialog={openActivitiesDialog}
            openFeaturesDialog={openFeaturesDialog}
            openPlanningGridsDialog={openPlanningGridsDialog}
            openCumulativeImpactDialog={openCumulativeImpactDialog}
            openAtlasLayersDialog={openAtlasLayersDialog}
          />
        </React.Fragment>
      )}
    </div>
  );
};

export default App;

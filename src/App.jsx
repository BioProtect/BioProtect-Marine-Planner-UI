import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { getMaxNumberOfClasses, zoomToBounds } from "./Helpers";

import AboutDialog from "./AboutDialog";
import AddToMap from "@mui/icons-material/Visibility";
import AlertDialog from "./AlertDialog";
import AtlasLayersDialog from "./AtlasLayersDialog";
import CONSTANTS from "./constants";
import ChangePasswordDialog from "./User/ChangePasswordDialog";
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
import ImportFeaturesDialog from "./ImportComponents/ImportFeaturesDialog";
import ImportFromWebDialog from "./ImportComponents/ImportFromWebDialog";
import ImportGBIFDialog from "./ImportComponents/ImportGBIFDialog";
import ImportMXWDialog from "./ImportComponents/ImportMXWDialog";
import ImportPlanningGridDialog from "./ImportComponents/ImportPlanningGridDialog";
import ImportProjectDialog from "./ImportComponents/ImportProjectDialog";
import InfoPanel from "./LeftInfoPanel/InfoPanel";
import LoadingDialog from "./LoadingDialog";
import LoginDialog from "./LoginDialog";
//mapbox imports
import MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
import Menu from "@mui/material/Menu";
//project components
import MenuBar from "./MenuBar/MenuBar";
import MenuItemWithButton from "./MenuItemWithButton";
import NewFeatureDialog from "./NewFeatureDialog";
import NewMarinePlanningGridDialog from "./Impacts/NewMarinePlanningGridDialog";
import NewPlanningGridDialog from "./NewPlanningGridDialog";
import NewProjectDialog from "./NewProjectDialog";
import NewProjectWizardDialog from "./NewProjectWizardDialog";
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
import React from "react";
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
/*eslint-disable no-unused-vars*/
import axios from "axios";
import classyBrew from "classybrew";
import jsonp from "jsonp-promise";
import mapboxgl from "mapbox-gl";
import packageJson from "../package.json";

// SERVICES
import { createNewUser, updateUser, deleteUser, getUsers} from "./User/userService";
import { getProjectList, getProjectsForFeature, prepareFormDataNewProject, createImportProject } from "./Projects/projectsService";
import { uploadFileToFolder, uploadFiles, uploadFileToProject } from "./ImportComponents/importService";
import { getPaintProperty, getTypeProperty } from "./Features/featuresService";
import { classifyData, changeRenderer, changeNumClasses, changeColorCode, changeShowTopClasses, initialiseFillColorExpression, getPaintProperties, getColorForStatus} from "./Rendering/renderingService";


//GLOBAL VARIABLES
let MARXAN_CLIENT_VERSION = packageJson.version;
let timers = []; //array of timers for seeing when asynchronous calls have finished

import React, { useState, useEffect, useCallback } from "react";
import { Map } from 'mapbox-gl'; // Assuming you're using mapbox-gl
import classyBrew from "classybrew";
import CONSTANTS from './constants'; 
import { addLocalServer, getServerCapabilities, filterAndSortServers } from "./Server/serverFunctions";

const App = () => {
  const [registry, setRegistry] = useState(undefined);
  const [marxanServers, setMarxanServers] = useState([]);
  const [marxanServer, setMarxanServer] = useState({});
    const [brew, setBrew] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
    const [wdpaVectorTileLayer, setWdpaVectorTileLayer] = useState('');
    const [newWDPAVersion, setNewWDPAVersion] = useState(false);
    const [activeTab, setActiveTab] = useState("");



const [dialogsState, setDialogsState] = useState({
  addToProject: true,
  activities: [],
  activitiesDialogOpen: false,
  allFeatures: [],
  allImpacts: [],
  aboutDialogOpen: false,
  addingRemovingFeatures: false,
  atlasLayers: [],
  atlasLayersDialogOpen: false,
  baseline: "North Star",
  basemaps: [],
  clumpingRunning: false,
  clumpingDialogOpen: false,
  costsDialogOpen: false,
  costsLoading: false,
  costnames: [],
  currentFeature: {},
  cumulativeImpactDialogOpen: false,
  dataBreaks: [],
  dismissedNotifications: [],
  featureDatasetFilename: "",
  feature_metadata: {},
  featureDialogOpen: false,
  featuresDialogOpen: false,
  file: {},
  files: {},
  gapAnalysis: [],
  gapAnalysisDialogOpen: false,
  guestUserEnabled: true,
  identifyFeatures: [],
  identifyPlanningUnits: {},
  identifyProtectedAreas: [],
  identifyVisible: false,
  importCostsDialogOpen: false,
  importFeaturesDialogOpen: false,
  importFromWebDialogOpen: false,
  importGBIFDialogOpen: false,
  importMXWDialogOpen: false,
  importPlanningGridDialogOpen: false,
  loggedIn: false,
  loading: false,
  mapCentre: { lng: 0, lat: 0 },
  mapZoom: 12,
  menuAnchor: null,
  newFeaturePopoverOpen: false,
  newProjectDialogOpen: false,
  newProjectWizardDialogOpen: false,
  notifications: [],
  notificationsOpen: false,
  pa_layer_visible: false,
  planningGridDialogOpen: false,
  planningGridsDialogOpen: false,
  planning_unit_grids: [],
  planning_units: [],
  project: "",
  projects: [],
  projectFeatures: [],
  projectList: [],
  projectListDialogHeading: "",
  projectListDialogTitle: "",
  puEditing: false,
  resendPasswordDialogOpen: false,
  resetDialogOpen: false,
  runningImpactMessage: "Import Activity",
  selectedCosts: [],
  selectedFeatureIds: [],
  selectedImpactIds: [],
  selectedLayers: [],
  shareableLink: false,
  shareableLinkDialogOpen: false,
  shareableLinkUrl: "",
  updateWDPADialogOpen: false,
  unauthorisedMethods: [],
  user: "",
  userData: { SHOWWELCOMESCREEN: true, REPORTUNITS: "Ha" },
  users: [],
  usersDialogOpen: false,
  welcomeDialogOpen: false,
  wdpaAttribution: "",
  runningImpactMessage: "Import Activity",
  impactDatasetFilename: "",
  runningImpactMessage: "Import Activity",
  newMarinePlanningGridDialogOpen: false,
  gapAnalysis: [],
  visibleLayers: [],
  atlasLayers: [],
  selectedLayers: [],
  selectedImpactIds: [],
  impact_metadata: {},
  runningImpactMessage: "Import Activity",
  allImpacts: [],
  cumulativeImpactDialogOpen: false,
  activitiesDialogOpen: false,
  atlasLayersDialogOpen: false,
  activities: [],
  uploadedActivities: [],
  humanActivitiesDialogOpen: false,
  importedActivitiesDialogOpen: false,
  NewMarinePlanningGridDialogOpen: false,
  menuAnchor: null,
});


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("project")) {
      setDialogsState(prevState => ({ ...prevState, loggedIn: true, shareableLink: true }));
    }

    const fetchGlobalVariables = async () => {
      try {
        const response = await fetch(CONSTANTS.MARXAN_REGISTRY);
        const registryData = await response.json();
        setRegistry(registryData);
        mapboxgl.accessToken = "pk.eyJ1IjoiY3JhaWNlcmphY2siLCJhIjoiY2syeXhoMjdjMDQ0NDNnbDk3aGZocWozYiJ9.T-XaC9hz24Gjjzpzu6RCzg";
        setBrew(new classyBrew());
        setDialogsState(prevState => ({ ...prevState, basemaps: registryData.MAPBOX_BASEMAPS }));
        await initialiseServers(registryData.MARXAN_SERVERS);
        if (searchParams.has("project")) openShareableLink(searchParams);
        if (searchParams.has("server")) selectServerByName(searchParams.get("server"));
      } catch (error) {
        console.error("Error fetching global variables:", error);
      }
    };
    fetchGlobalVariables();
  }, []);

  const openShareableLink = async (searchParams) => {
    try {
      if (
        searchParams.has("server") &&
        searchParams.has("user") &&
        searchParams.has("project")
      ) {
        const serverData = marxanServers.find(
          server => server.name === searchParams.get("server")
        );
        if (!serverData) throw new Error("Invalid server parameter on shareable link");
        if (serverData.offline) throw new Error("Server is offline");
        if (!serverData.guestUserEnabled) throw new Error("Guest user is not enabled on the server");
        selectServer(serverData);
        await switchToGuestUser();
        await validateUser();
        await loadProject(searchParams.get("project"), searchParams.get("user"));
        setDialogsState(prevState => ({ ...prevState, shareableLink: false }));
      } else {
        throw new Error("Invalid query parameters on shareable link");
      }
    } catch (err) {
      alert(err.message);
    }
  };
  
  const setWDPAVectorTilesLayerName = useCallback((wdpa_version) => {
    // Get the short version of the wdpa_version, e.g., August 2019 to aug_2019
    const version = wdpa_version.toLowerCase().substr(0, 3) + "_" + wdpa_version.substr(-4);
    setWdpaVectorTileLayer(`wdpa_${version}_polygons`);
  }, []);


  const switchToGuestUser = useCallback(async () => {
  // Set the state to switch to guest user
  await setDialogsState(prevState => ({ 
    ...prevState, 
    user: "guest", 
    password: "password" 
  }));
  return "Switched to guest user";
}, []);

const validateUser = async (user, password) => {
  try {
    await checkPassword(user, password);    
    await login();
    return "User validated";
  } catch (error) {
    console.error("Validation or login failed:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

  // const loadProject = useCallback(async (project, user) => {
  //   // Implement project loading logic
  // }, []);

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
  const _get = useCallback((params, timeout = CONSTANTS.TIMEOUT) => {
    
    setDialogsState(prevState => ({ ...prevState,loading: true}));
    return new Promise((resolve, reject) => {
      jsonp(marxanServer.endpoint + params, { timeout })
        .promise
        .then(response => {
          setDialogsState(prevState => ({ ...prevState,loading: false}));
          if (!checkForErrors(response)) {
            resolve(response);
          } else {
            reject(response.error);
          }
        })
        .catch(err => {
          setDialogsState(prevState => ({ ...prevState, loading:false}));
          setSnackBar(
            `Request timeout - See <a href='${CONSTANTS.ERRORS_PAGE}#request-timeout' target='blank'>here</a>`
          );
          reject(err);
        });
    });
  }, [checkForErrors, setSnackBar]);

  //makes a POST request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  const _post = useCallback(async (method, formData, timeout = CONSTANTS.TIMEOUT, withCredentials = CONSTANTS.SEND_CREDENTIALS) => {
    setDialogsState(prevState => ({ ...prevState,loading: true}));
    
    try {
      const controller = new AbortController();
      const { signal } = controller;
      // Set a timeout to abort the request if it takes too long
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(marxanServer.endpoint + method, formData, {
        method: 'POST',
        credentials: withCredentials,
        signal, // Pass the AbortSignal to the fetch call
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (!checkForErrors(data)) {
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        if (err.message !== 'Network Error') {
          setSnackbarMessage(err.message);
        }
      }
      throw err;
    } finally {
      setDialogsState(prevState => ({ ...prevState,loading: false}));
    }
  }, [marxanServer.endpoint, checkForErrors]);
  
  // Memoized WebSocket function
  const _ws = useCallback((params, msgCallback) => {
    return new Promise((resolve, reject) => {
      // Create a new WebSocket instance
      const ws = new WebSocket(marxanServer.websocketEndpoint + params);

      // WebSocket event handlers
      ws.onMessage = (evt) => {
        const message = JSON.parse(evt.data);

        if (!checkForErrors(message)) {
          if (message.status === 'Finished') {
            msgCallback(message);
            setDialogsState(prevState => ({ ...prevState, preprocessing: false }));
            resolve(message);
          } else {
            msgCallback(message);
          }
        } else {
          msgCallback(message);
          setDialogsState(prevState => ({ ...prevState, preprocessing: false }));
          reject(message.error);
        }
      };

      ws.onOpen = (evt) => {
        // Handle WebSocket open event if necessary
      };

      ws.onError = (evt) => {
        setDialogsState(prevState => ({ ...prevState, preprocessing: false }));
        reject(evt);
      };

      ws.onClose = (evt) => {
        setDialogsState(prevState => ({ ...prevState, preprocessing: false }));
        if (!evt.wasClean) {
          msgCallback({ status: 'SocketClosedUnexpectedly' });
        } else {
          reject(evt);
        }
      };
    });
  }, [marxanServer.websocketEndpoint, checkForErrors]);

  // Memoized function to check for errors using responseIsTimeoutOrEmpty and isServerError
  const checkForErrors = useCallback((response, showSnackbar = true) => {
    const networkError = responseIsTimeoutOrEmpty(response, showSnackbar);
    const serverError = isServerError(response, showSnackbar);
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
  }, [responseIsTimeoutOrEmpty, isServerError]);

  // Memoized function to check for timeout errors or empty responses
  const responseIsTimeoutOrEmpty = useCallback((response, showSnackbar = true) => {
    if (!response) {
      const msg = "No response received from server";
      if (showSnackbar) {
        setSnackBar(msg);
      }
      return true;
    }
    return false;
  }, [setSnackBar]);

  // Memoized function to check if the response indicates a server error
  const isServerError = useCallback((response, showSnackbar = true) => {
    if (
      (response && response.error) ||
      (response &&
        response.hasOwnProperty("metadata") &&
        response.metadata.hasOwnProperty("error") &&
        response.metadata.error != null)
    ) {
      const err = response.error ? response.error : response.metadata.error;
      if (showSnackbar) {
        setSnackBar(err);
      }
      return true;
    } else {
      // Handle warnings from server responses
      if (response && response.warning) {
        if (showSnackbar) {
          setSnackBar(response.warning);
        }
      }
      return false;
    }
  }, [setSnackBar]);

  //called when any websocket message is received - this logic removes duplicate messages
  const wsMessageCallback = async (message) =>  {
    //dont log any clumping projects
    if (message.user === "_clumping") return;
    //log the message
    logMessage(message);
    switch (message.status) {
      case "Started": //from the open method of all MarxanWebSocketHandler subclasses
        //set the processing state when the websocket starts
        setDialogsState(prevState => ({ ...prevState, preprocessing: true }));
        break;
      case "pid": //from marxan runs and preprocessing - the pid is an identifer and the pid, e.g. m1234 is a marxan run process with a pid of 1234
        setDialogsState(prevState => ({ ...prevState, pid: message.pid }));
        break;
      case "FeatureCreated":
        //remove all preprocessing messages
        removeMessageFromLog("Preprocessing");
        await newFeatureCreated(message.id);
        break;
      case "Finished": //from the close method of all MarxanWebSocketHandler subclasses
        //reset the pid
        resetPID();
        //remove all preprocessing messages
        removeMessageFromLog("Preprocessing");
        break;
      default:
        break;
    }
  }

  //resets the pid value
  const resetPID = () => {
    setDialogsState(prevState => ({ ...prevState, pid: 0 }));
  }
  
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
      resetPID();
    } else {
      // Check if the message has a PID and handle accordingly
      if (message.hasOwnProperty("pid") && message.status !== "RunningMarxan") {
        const existingMessages = logMessages.filter((_message) => 
          _message.hasOwnProperty("pid") && _message.pid === message.pid
        );

        if (existingMessages.length > 0) {
          // Compare with the latest status
          if (message.status !== existingMessages[existingMessages.length - 1].status) {
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
  }, [logMessages]);

  // removes a message from the log by matching on pid and status or just status
  // update the messages state - filter previous messages state by pid and status
  const removeMessageFromLog = useCallback((status, pid) => {
    setDialogsState(prevState => ({
      ...prevState,
      logMessages: prevState.logMessages.filter(message => {
        if (pid !== undefined) {
          return !(message.pid === pid && message.status === status);
        } else {
          return !(message.status === status);
        }
      }),
    }));
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
const selectServer = useCallback((server) => {
  console.log('server ', server);
  setMarxanServer(server);
  // Check if there is a new version of the WDPA
  setNewWDPAVersion(server.wdpa_version !== registry.WDPA.latest_version);
  // Set the link to the WDPA vector tiles layer name based on the version
  setWDPAVectorTilesLayerName(server.wdpa_version);
  // If server is online, not CORS-enabled, and guest user is enabled, switch to guest user
  if (!server.offline && !server.corsEnabled && server.guestUserEnabled) {
    switchToGuestUser();
  }
}, [registry.WDPA.latest_version]);
  
  const initialiseServers = useCallback(async (servers) => {
  try {
    // Add the local machine server to the list
    addLocalServer(servers);
    // Fetch capabilities for all servers
    await getAllServerCapabilities(servers);
    // filter and sort servers
    const filteredAndSortedServers = filterAndSortServers(servers);
    // Update the marxanServers state with the filtered and sorted server list
    setMarxanServers(filteredAndSortedServers);
    return "ServerData retrieved";
  } catch (error) {
    console.error("Failed to initialise servers:", error);
    throw error;
  }
}, [setMarxanServers]);

//gets the capabilities of all servers
// Function to get capabilities for all servers
const getAllServerCapabilities = useCallback(async (marxanServers) => {
  try {
    const promises = marxanServers.map(async (server) => {
      const updatedServer = await getServerCapabilities(server);
      return updatedServer;
    });
    const results = await Promise.all(promises);
    setServerCapabilities(results);
  } catch (error) {
    console.error('Error getting server capabilities:', error);
  }
}, []);

useEffect(() => {
  getAllServerCapabilities(marxanServers);
}, [marxanServers, getAllServerCapabilities]);

// Function to programmatically select a server
const selectServerByName = useCallback((servername) => {
  // Remove the search part of the URL
  window.history.replaceState({}, document.title, '/');
  const server = marxanServers.find((item) => item.name === servername);
  if (server) {
    selectServer(server);
  }
}, [marxanServers]);

const closeSnackbar = () => {
  setDialogsState(prevState => ({ ...prevState, snackbarOpen: false }));
}

const startLogging = (clearLog = false) => {
  //switches the results pane to the log tab and clears log if needs be
  setActiveTab("log");
  if (clearLog) this.clearLog();
}

// clears the log
const clearLog = ()=> {
  setDialogsState(prevState => ({ ...prevState, logMessages: [] }));
}

// Main logging method - all log messages use this method
const messageLogger = useCallback((message) => {
  // Add a timestamp to the message
  const timestampedMessage = { ...message, timestamp: new Date() };
  // Update the state with the new log message
  setDialogsState(prevState => ({
    ...prevState,
    logMessages: [...prevState.logMessages, timestampedMessage],
  }));
}, []);

  // utiliy method for getting all puids from normalised data, e.g. from [["VI", [7, 8, 9]], ["IV", [0, 1, 2, 3, 4]], ["V", [5, 6]]]
const getPuidsFromNormalisedData = (normalisedData) =>  normalisedData.flatMap(item => item[1]);

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// MANAGING USERS
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
const handleCreateUser = async (user, password, name, email) => await createNewUser(user, password, name, email);
  
const handleUserUpdate = async (parameters, user=dialogsState.user) =>  await updateUser(parameters, user);
  
const handleGetUsers = async () =>  await getUsers();

const handleDeleteUser = async (user) => await deleteUser(user);

const changeUserName = (user) => setDialogsState(prevState => ({ ...prevState, user: user }));

const changePassword = (password) => setDialogsState(prevState => ({ ...prevState, password: password }));

const checkPassword = async (user, password) => await _get(`validateUser?user=${user}&password=${password}`, 10000);

const changeEmail = (value) => setDialogsState(prevState => ({ ...prevState, resendEmail: value }));

  //the user is validated so login
const login = async () => {
  try {
    const response = await _get(`getUser?user=${dialogsState.user}`);
    setDialogsState({
      userData: response.userData,
      unauthorisedMethods: response.unauthorisedMethods,
      project: response.userData.LASTPROJECT,
      dismissedNotifications: response.dismissedNotifications || [],
    });

    // Set the basemap
    const basemap = dialogsState.basemaps.find(item => item.name === response.userData.BASEMAP);
    await setBasemap(basemap);
    await getAllFeatures();
    await loadProject(response.userData.LASTPROJECT, dialogsState.user);
    await getPlanningUnitGrids();
    return "Logged in";
  } catch (error) {
    console.error("Login failed:", error);
    // Handle error appropriately
    throw error;
  }
};
  //log out and reset some state
const logout = () => {
  hideUserMenu();
  setDialogsState(prevState => ({ ...prevState,
    loggedIn: false,
    user: "",
    password: "",
    project: "",
    owner: "",
    runParams: [],
    files: {},
    metadata: {},
    renderer: {},
    planning_units: [],
    projectFeatures: [],
    infoPanelOpen: false,
    resultsPanelOpen: false,
    brew: new classyBrew(),
    notifications: [],
  }));
  resetResults();
  //clear the currently set cookies
  _get("logout").then((response) => {});
}
  
const resendPassword = async () => {
  try {
    const response = await _get(`resendPassword?user=${dialogsState.user}`);
    setSnackBar(response.info);
    // Close the resend password dialog
    setDialogsState(prevState => ({ ...prevState, resendPasswordDialogOpen: false }));
  } catch (error) {
    console.error("Failed to resend password:", error);
  }
};

const changeRole = async (user, role) => {
  await handleUserUpdate({ ROLE: role }, user);
  const updatedUsers = dialogsState.users.map((item) => 
    item.user === user ? { ...item, ROLE: role } : item
  );
  // Update the state with the modified user list
  setDialogsState(prevState => ({ ...prevState, users: updatedUsers }));
}

//toggles if the guest user is enabled on the server or not  
const toggleEnableGuestUser = async () => {
  const response = await _get("toggleEnableGuestUser");
  // Update the marxanServer object with the new guestUserEnabled status
  setMarxanServer(prevMarxanServer => ({
    ...prevMarxanServer,
    guestUserEnabled: response.enabled
  }));
};
  
  const toggleProjectPrivacy = async (newValue) => {
    const response = await updateProjectParameter("PRIVATE", newValue);
    setDialogsState(prevState => ({
      ...prevState,
      metadata: {
        ...prevState.metadata, // Ensure to update metadata correctly
        PRIVATE: newValue === "True",
      },
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
    if (dialogsState.registry.NOTIFICATIONS.length > 0) {
      addNotifications(dialogsState.registry.NOTIFICATIONS);
    }
    // Check for new version of wdpa data
    // From the Marxan Registry WDPA object - if there is then show a notification to admin users
    if (dialogsState.newWDPAVersion) {
      addNotifications([
        {
          id: "wdpa_update_" + dialogsState.registry.WDPA.latest_version,
          html: "A new version of the WDPA is available. Go to Help | Server Details for more information.",
          type: "Data Update",
          showForRoles: ["Admin"],
        },
      ]);
    }
    //see if there is a new version of the marxan-client software
    if (MARXAN_CLIENT_VERSION !== dialogsState.registry.CLIENT_VERSION) {
      addNotifications([
        {
          id: "marxan_client_update_" + dialogsState.registry.CLIENT_VERSION,
          html:
            "A new version of marxan-client is available (" +
            dialogsState.registry.CLIENT_VERSION +
            "). Go to Help | About for more information.",
          type: "Software Update",
          showForRoles: ["Admin"],
        },
      ]);
    }
    //see if there is a new version of the marxan-server software
    if (
      dialogsState.marxanServer.server_version !==
      dialogsState.registry.SERVER_VERSION
    ) {
      addNotifications([
        {
          id: "marxan_server_update_" + dialogsState.registry.SERVER_VERSION,
          html:
            "A new version of marxan-server is available (" +
            dialogsState.registry.SERVER_VERSION +
            "). Go to Help | Server Details for more information.",
          type: "Software Update",
          showForRoles: ["Admin"],
        },
      ]);
    }
    //check that there is enough disk space
    if (dialogsState.marxanServer.disk_space < 1000) {
      addNotifications([
        {
          id: "hardware_1000",
          html: "Disk space < 1Gb",
          type: "Hardware Issue",
          showForRoles: ["Admin"],
        },
      ]);
    } else if (dialogsState.marxanServer.disk_space < 2000) {
        addNotifications([
          {
            id: "hardware_2000",
            html: "Disk space < 2Gb",
            type: "Hardware Issue",
            showForRoles: ["Admin"],
          },
        ]);
      } else if (dialogsState.marxanServer.disk_space < 3000) {
          addNotifications([
            {
              id: "hardware_3000",
              html: "Disk space < 3Gb",
              type: "Hardware Issue",
              showForRoles: ["Admin"],
            },
          ]);
      }
  })
  
  const addNotifications = (notifications) => {
    const currentNotifications = [...dialogsState.notifications];
    // Process and filter notifications based on role, dismissal, and expiry
    const processedNotifications = notifications.map((item) => {
      const allowedForRole = item.showForRoles.includes(dialogsState.userData.ROLE);
      const notDismissed = !dialogsState.dismissedNotifications.includes(String(item.id));
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
  const updatedNotifications = [...currentNotifications, ...processedNotifications];
    setDialogsState(prevState => ({ ...prevState, notifications: updatedNotifications}));
  }

  //hides the notifications from the UI
  const hideNotifications = () => {
    setDialogsState(prevState => ({ ...prevState, notificationsOpen: false }));
  }

  //removes a notification
  const removeNotification = async (notification) => {
    //remove the notification from the state
    const updatedNotifications = dialogsState.notifications.filter((item) => item.id !== notification.id);
    //remove it in the users notifications.dat file
    await dismissNotification(notification);
    //set the state
    setDialogsState(prevState => ({ ...prevState, notifications: updatedNotifications }));
  }

  //dismisses a notification on the server
  const dismissNotification = async (notification) => {
    await _get(`dismissNotification?user=${dialogsState.user}&notificationid=${notification.id}`);
  }

  //clears all of the dismissed notifications on the server
  const resetNotifications = async () => {
    await _get(`resetNotifications?user=${dialogsState.user}`);
    setDialogsState(prevState => ({ 
      ...prevState, 
      notifications: [], 
      dismissedNotifications: []
    }));
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
  const upgradeProject = async (project) => await _get(`upgradeProject?user=${dialogsState.user}&project=${project}`);

  //updates the project parameters back to the server (i.e. the input.dat file)
  const updateProjectParams = async (project, parameters) => {
    //initialise the form data
    let formData = new FormData();
    formData.append("user", dialogsState.owner);
    formData.append("project", project);
    appendToFormData(formData, parameters);
    //post to the server and return a promise
    return await _post("updateProjectParameters", formData);
  }

  //updates a single parameter in the input.dat file directly
  
  const updateProjectParameter = async (parameter, value) => await updateProjectParams(dialogsState.project, { [parameter]: value });


  //updates the run parameters for the current project
  const updateRunParams = async (array) => {
    //convert the run parameters array into an object
    const parameters = array.reduce((acc, obj) => {
      acc[obj.key] = obj.value;
      return acc;
    }, {});
    await updateProjectParams(dialogsState.project, parameters);
    setDialogsState(prevState => ({ ...prevState, runParams: parameters }));
  }

  //gets the planning unit grids
  const getPlanningUnitGrids = async () => {
    const response = await _get("getPlanningUnitGrids");
    setDialogsState(prevState => ({
      ...prevState,
      planning_unit_grids: response.planning_unit_grids
    }));
};


const loadProject = async (project, user) => {
  try {
    // Reset the results from any previous projects
    resetResults();
    // Fetch project data
    const response = await _get(`getProject?user=${user}&project=${project}`);
    // Update state based on the data returned from the server
    setDialogsState(prevState => ({
      ...prevState,
      loggedIn: true,
      project: response.project,
      owner: user,
      runParams: response.runParameters,
      files: { ...response.files },
      metadata: response.metadata,
      renderer: response.renderer,
      planning_units: response.planning_units,
      costnames: response.costnames,
      infoPanelOpen: true,
      resultsPanelOpen: true,
    }));

    // If PLANNING_UNIT_NAME passed then change to this planning grid and load the results if available
    if (response.metadata.PLANNING_UNIT_NAME) {
      await changePlanningGrid(CONSTANTS.MAPBOX_USER + "." + response.metadata.PLANNING_UNIT_NAME);
      await getResults(user, response.project);
    }

    // Set a local variable - Dont need to track state with these variables as they are not bound to anything
    this.feature_preprocessing = response.feature_preprocessing;
    this.previousIucnCategory = response.metadata.IUCN_CATEGORY;
    this.protected_area_intersections = response.protected_area_intersections

    // Initialize interest features and preload costs data
    initialiseInterestFeatures(response.metadata.OLDVERSION, response.features);
    await getPlanningUnitsCostData();
    // Activate the project tab
    project_tab_active();
    return "Project loaded";
  } catch (error) {
    console.log("error", error);
    
    if (error.toString().includes("Logged on as read-only guest user")) {
      setDialogsState(prevState => ({ ...prevState, loggedIn: true }));
      return "No project loaded - logged on as read-only guest user";
    }

    if (error.toString().includes("does not exist")) {
      // Handle case where project does not exist
      setSnackBar("Loading first available project");
      await loadProject("", dialogsState.user);
      return
    }
    
    throw error; // Re-throw the error to handle it outside if needed
  }
};


  //matches and returns an item in an object array with the passed id - this assumes the first item in the object is the id identifier
  const getArrayItem = (arr, id) => arr.find(([itemId]) => itemId === id);


  //initialises the interest features based on the currently loading project
const initialiseInterestFeatures = (oldVersion, projectFeatures) => {
  // Determine features based on project version
  const features = oldVersion
    ? projectFeatures.map((feature) => ({ ...feature })) // deep copy
    : [...dialogsState.allFeatures];

  // Extract feature IDs
  const projectFeatureIds = projectFeatures.map((item) => item.id);

  // Process features
  const processedFeatures = features.map((feature) => {
     // Check if the feature is part of the current project
    const projectFeature = projectFeatureIds.includes(item.id)
      ? projectFeatures[projectFeatureIds.indexOf(item.id)]
      : null;
    
    const preprocessing = getArrayItem(this.feature_preprocessing, feature.id);
    // Add required attributes
    addFeatureAttributes(feature, oldVersion);

    // Populate data if feature is part of the project
    if (projectFeature) {
      Object.assign(feature, {
        selected: true,
        preprocessed: !!preprocessing,
        pu_area: preprocessing ? preprocessing[1] : -1,
        pu_count: preprocessing ? preprocessing[2] : -1,
        spf: projectFeature.spf,
        target_value: projectFeature.target_value,
        occurs_in_planning_grid: preprocessing && preprocessing[2] > 0,
      });
    }
    return feature;
  });
  
  // Get the selected feature ids
  getSelectedFeatureIds();

  // Update state
  setDialogsState((prevState) => ({
    ...prevState,
    allFeatures: processedFeatures,
    projectFeatures: processedFeatures.filter((item) => item.selected),
  }));
  
  
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
    resetRun();                   //reset the run
    this.cost_data = undefined;   //reset the cost data
    hideFeatureLayer();      //reset any feature layers that are shown
  }
  
  //resets state in between runs
  const resetRun = () => {
    this.runMarxanResponse = {};
    setDialogsState(prevState => ({ ...prevState, solutions: [] }));
  }

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// PROJECTS
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

const createNewProject = async (project) => {
  const formData = prepareFormDataNewProject(project, dialogsState.user);
  const response = await _post("createProject", formData);

  setSnackBar(response.info);
  setDialogsState(prevState => ({ ...prevState, projectsDialogOpen: false }));

  await loadProject(response.name, response.user);
}

const createNewNationalProject = async (params) => await createNewPlanningUnitGrid(params.iso3, params.domain, params.areakm2, params.shape);


//REST call to delete a specific project
const deleteProject = async (user, project, silent = false) => {
  try {
    // Make the request to delete the project
    const response = await _get(`deleteProject?user=${user}&project=${project}`);
    
    // Fetch the updated list of projects
    await getProjects();

    // Show a snackbar message, but allow it to be silent if specified
    setSnackBar(response.info, silent);
    
    // Check if the deleted project is the current one
    if (response.project === dialogsState.project) {
      setSnackBar("Current project deleted - loading first available");

      // Find the next available project
      const nextProject = dialogsState.projects.find(p => p.name !== dialogsState.project);
      
      if (nextProject) {
        await loadProject(nextProject.name, dialogsState.user);
      }
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    // Optionally handle the error, e.g., set an error state or notify the user
  }
}

//exports the project on the server and returns the *.mxw file
const exportProject = async (user, project) => {
  try {
    setActiveTab("log");
    const message = await _ws(`exportProject?user=${user}project=${project}`, wsMessageCallback);
    return marxanServer.endpoint + "exports/" + message.filename
  } catch (error) {
    console.log(error)
  }
}

const cloneProject = async (user, project) => {
  const response = await _get(`cloneProject?user=${user}&project=${project}`);
  getProjects();
  setSnackBar(response.info);
}

  //rename a specific project on the server
const renameProject = async (newName) => {
  if (newName !== "" && newName !== dialogsState.project) {
    const response = await _get(`renameProject?user=${dialogsState.owner}&project=${dialogsState.project}&newName=${newName}`);
    setDialogsState(prevState => ({ ...prevState, project: newName }));
    setSnackBar(response.info);
    return "Project renamed"
  }
}
  
  //rename the description for a specific project on the server
const renameDescription = async (newDesc) => {
    await updateProjectParameter("DESCRIPTION", newDesc);
    setDialogsState(prevState => ({ 
      ...prevState,
      metadata: Object.assign(dialogsState.metadata, { DESCRIPTION: newDesc })
    }));
  return "Description Renamed";
}
  
const getProjects = async () => {
  const response = await _get(`getProjects?user=${dialogsState.user}`);
  //filter the projects so that private ones arent shown
  const projects = response.projects.filter((proj) => {
    return !((proj.private) && (proj.user !== dialogsState.user) && (dialogsState.userData.ROLE !== "Admin"))
  })
  setDialogsState(prevState => ({ ...prevState, projects: projects }));
}

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
  startLogging();               // start the logging
  resetProtectedAreas();        // reset all of the protected and target areas for all features
  resetRun();                   // reset the run results
  
  try {
     //update the spec.dat file with any that have been added or removed or changed target or spf
    await updateSpecFile();
    updatePuFile();               // when the species file has been updated, update the planning unit file
  } catch (error) {
    console.error(error);
  }
 
  try {
    await updatePuvsprFile()      // update the PuVSpr file - preprocessing using websockets
  } catch (error) {
    //updatePuvsprFile error
    console.error(error);
  }
  
  try {
    const response = await startMarxanJob(dialogsState.owner, dialogsState.project); //start the marxan job
    await getRunLogs();           //update the run log
    
    if (!checkForErrors(response)) {
      await getResults(response.user, response.project);  //run completed - get the results
      features_tab_active();      //switch to the features tab
    } else {
      runFinished([]);            //set state with no solutions
    }
  } catch (error) {
    marxanStopped(error);
  }
}

  //stops a process running on the server
const stopProcess = async (pid) => {
  try {
    await _get(`stopProcess?pid=${pid}`, 10000);
  } catch (error) {
    console.log(error);
  }
  getRunLogs();
}

  //ui feedback when marxan is stopped by the user
const marxanStopped = (error) => getRunLogs();

const resetProtectedAreas = () => {
  const updatedFeatures = dialogsState.allFeatures.map(feature => ({
    ...feature,
    protected_area: -1,
    target_area: -1,
  }));
  
  // Set the state with updated features
  setDialogsState(prevState => ({ ...prevState, allFeatures: updatedFeatures }));
}

  //updates the species file with any target values that have changed
const updateSpecFile = async () => {
  const formData = new FormData();
  formData.append("user", dialogsState.owner);
  formData.append("project", dialogsState.project);
  //prepare the data that will populate the spec.dat file
  formData.append("interest_features", dialogsState.projectFeatures.map(item => item.id).join(","));
  formData.append("target_values", dialogsState.projectFeatures.map(item => item.target_value).join(","));
  formData.append("spf_values", dialogsState.projectFeatures.map(item => item.spf).join(","));
  return await _post("updateSpecFile", formData);
}

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
  closeFeatureMenu();
  startLogging();
  preprocessFeature(feature);
}

//preprocess synchronously, i.e. one after another
const preprocessAllFeatures = async () => {
  for (const feature of dialogsState.projectFeatures) {
    if (!feature.preprocessed) {
      await preprocessFeature(feature);    
    }
  }
}

//preprocesses a feature using websockets - i.e. intersects it with the planning units grid and writes the intersection results into the puvspr.dat file ready for a marxan run - this will have no server timeout as its running using websockets
const preprocessFeature = async (feature) => {
  try {
    // Switch to the log tab
    setActiveTab("log");

    // Call the WebSocket
    const message = await _ws(
      `preprocessFeature?user=${dialogsState.owner}&project=${dialogsState.project}&planning_grid_name=${dialogsState.metadata.PLANNING_UNIT_NAME}&feature_class_name=${feature.feature_class_name}&alias=${feature.alias}&id=${feature.id}`,
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
const startMarxanJob = async (user, project) => {
  try {
    // Make the request to get the Marxan data
    return await _ws(`runMarxan?user=${user}&project=${project}`, wsMessageCallback);
  } catch (error) {
    console.error("Error starting Marxan job:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

//gets the results for a project
const getResults = async (user, project) => {
  try {
    const response = await _get(`getResults?user=${user}&project=${project}`);
    runCompleted(response);
    return "Results retrieved";
  } catch (error) {
    console.error("Unable to get results:", error);
    throw new Error("Unable to get results"); // Optionally re-throw the error for further handling
  }
};

//run completed
const runCompleted = (response) => {
  this.runMarxanResponse = response;

  // Check if solutions are present
  if (this.runMarxanResponse.ssoln?.length > 0) {
    setSnackBar(response.info);
    renderSolution(this.runMarxanResponse.ssoln, true);

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

    updateProtectedAmount(reponse.mvbest);
    runFinished(solutions);
  } else {
    // No solutions available
    runFinished([]);
  }
};

const runFinished = (solutions) => setDialogsState(prevState => ({ ...prevState, solutions: solutions }));

// Get the protected area information in m2 from marxan run and populate interest features with the values
const updateProtectedAmount = (mvData) => {
  // Create a map for quick lookup of mvData by feature ID
  const mvDataMap = new Map(mvData.map(([id, , targetArea, protectedArea]) => [id, { targetArea, protectedArea }]));

  // Update features with corresponding data from mvData
  const updatedFeatures = dialogsState.allFeatures.map((feature) => {
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
  setFeaturesState(updatedFeatures);
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

const importProject = async (project, description, zipFilename, files, planning_grid_name) => {
  let feature_class_name = "";
  let uploadId;

  startLogging();
  messageLogger({
    method: "importProject",
    status: "Importing",
    info: "Starting import..",
  });

  // Create a new project
  await createImportProject(project);
  messageLogger({
    method: "importProject",
    status: "Importing",
    info: `Project '${project}' created`,
  });

  try {
    // Import the planning unit file
    const puResponse = await importZippedShapefileAsPu(zipFilename, planning_grid_name, `Imported with the project '${project}'`);
    feature_class_name = puResponse.feature_class_name;
    uploadId = puResponse.uploadId;

    messageLogger({
      method: "importProject",
      status: "Importing",
      info: "Planning grid imported",
    });
  } catch (error) {
    deleteProject(dialogsState.user, project, true);
    throw error;
  }
  
  try {
    // Upload all the files
    await uploadFiles(files, project);
    messageLogger({
      method: "importProject",
      status: "Importing",
      info: "All files uploaded",
    });

    // Upgrade the project to the new version of Marxan
    await upgradeProject(project);
    messageLogger({
      method: "importProject",
      status: "Importing",
      info: "Project updated to new version",
    });

    // Update project parameters
    const formattedDate = new Date().toLocaleString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(',', '');

    await updateProjectParams(project, {
      DESCRIPTION: `${description} (imported from an existing Marxan project)`,
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

    // Load the project
    await loadProject(project, dialogsState.user);
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
const pad = (num, size) => num.toString().padStart(size, '0');

//imports a project from an mxd file
const importMXWProject = async (project, description, filename)=> {
  startLogging();
  await _ws(`importProject?user=${dialogsState.user}&project=${project}&filename=${filename}&description=$description}`, wsMessageCallback);
  refreshFeatures()
  loadProject(project, dialogsState.user);
}

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
    updateProtectedAmount(this.runMarxanResponse.mvbest);
    //load the sum of solutions which will already be loaded
    renderSolution(this.runMarxanResponse.ssoln, true);
  } else {
    const response = await getSolution(dialogsSate.owner, dialogsSate.project, solution);
    updateProtectedAmount(response.mv);
    renderSolution(response.solution, false);
  }
}

// Load a solution from another project - used in the clumping dialog - when the solution is loaded the paint properties are set on the individual maps through state changes
const loadOtherSolution = async (user, project, solution) => {
  const response =  await getSolution(user, project, solution)
  const paintProperties =getPaintProperties(response.solution, false, false);
  // Get the project that matches the project name from the this.projects property - this was set when the projectGroup was created
  if (this.projects) {
    const _projects = this.projects.filter((item) => item.projectName === project);
    // Get which clump it is
    const clump = _projects[0].clump;
    switch (clump) {
      case 0:
        setDialogsState(prevState => ({ ...prevState, map0_paintProperty: paintProperties }));
        break;
      case 1:
        setDialogsState(prevState => ({ ...prevState, map1_paintProperty: paintProperties }));
        break;
      case 2:
        setDialogsState(prevState => ({ ...prevState, map2_paintProperty: paintProperties }));
        break;
      case 3:
        setDialogsState(prevState => ({ ...prevState, map3_paintProperty: paintProperties }));
        break;
      case 4:
        setDialogsState(prevState => ({ ...prevState, map4_paintProperty: paintProperties }));
        break;
      default:
        break;
    }
  }
}

// Gets a solution
const getSolution = async (user, project, solution) => await _get(`getSolution?user=${user}&project=${project}&solution=${solution}`);


// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// CLASSIFICATION AND RENDERING
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// MOST FUNCTIONALITY MOVED TO Rendering/renderingServce.jsx

//renders the solution - data is the REST response and sum is a flag to indicate if the data is the summed solution (true) or an individual solution (false)
const renderSolution = (data, sum) => {
  if (!data) return;
  const paintProperties = getPaintProperties(data, sum, true);
  //set the render paint property
  this.map.setPaintProperty(
    CONSTANTS.RESULTS_LAYER_NAME,
    "fill-color",
    paintProperties.fillColor
  );
  this.map.setPaintProperty(
    CONSTANTS.RESULTS_LAYER_NAME,
    "fill-outline-color",
    paintProperties.oulineColor
  );
}

//renders the planning units edit layer according to the type of layer and pu status
const renderPuEditLayer = () => {
  const buildExpression = (units) => {
    if (units.length === 0) {
      return "rgba(150, 150, 150, 0)"; // Default color when no data
    }

    const expression = ["match", ["get", "puid"]];
    units.forEach((row, index) => expression.push(row[1], getColorForStatus(row[0])));
    // Default color for planning units not explicitly mentioned
    expression.push("rgba(150, 150, 150, 0)");
    return expression;
  };

  const expression = buildExpression(dialogsState.planning_units);

  //set the render paint property
  this.map.setPaintProperty(
    CONSTANTS.STATUS_LAYER_NAME,
    "line-color",
    expression
  );
  this.map.setPaintProperty(
    CONSTANTS.STATUS_LAYER_NAME,
    "line-width",
    CONSTANTS.STATUS_LAYER_LINE_WIDTH
  );
}

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
  this.map.setPaintProperty(CONSTANTS.COSTS_LAYER_NAME, "fill-color", expression);
  setLayerMetadata(CONSTANTS.COSTS_LAYER_NAME, { min: cost_data.min, max: cost_data.max });
  showLayer(CONSTANTS.COSTS_LAYER_NAME);
  return "Costs rendered";
}

// Convenience method to get rendered features safely & not show error message if the layer doesnt exist in the map style
const getRenderedFeatures = (pt, layers) => (this.map.getLayer(layers[0])) ?  this.map.queryRenderedFeatures(pt, { layers: layers }):  [];

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
  this.map = new mapboxgl.Map({
    container: this.mapContainer,
    style: url,
    center: [0, 0],
    zoom: 2,
  });
  //add event handlers for the load and error events
  this.map.on("load", mapLoaded);
  this.map.on("error", mapError);
  //click event
  this.map.on("click", mapClick);
  //style change, this includes adding/removing layers and showing/hiding layers
  this.map.on("styledata", mapStyleChanged);
}

const mapLoaded = (e) => {
  // this.map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right'); // currently full screen hides the info panel and setting position:absolute and z-index: 10000000000 doesnt work properly
  this.map.addControl(new mapboxgl.ScaleControl());
  this.map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
  this.map.addControl(new HomeButton());
  //create the draw controls for the map
  this.mapboxDrawControls = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    defaultMode: "draw_polygon",
  });
  this.map.on("moveend", (evt) => {
    if (dialogsState.clumpingDialogOpen) updateMapCentreAndZoom(); //only update the state if the clumping dialog is open
  });
  this.map.on("draw.create", polygonDrawn);
}

const updateMapCentreAndZoom = () => setDialogsState(prevState => ({ ...prevState, mapCentre: this.map.getCenter(), mapZoom: this.map.getZoom()}));

//catch all event handler for map errors
const mapError = useCallback((e) => {
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

  if (message !== "http status 200 returned without content.") {
    setSnackBar(`MapError: ${message}`);
    console.error(message);
  }
}, [setSnackBar]);

const mapClick = async (e) => {
  //if the user is not editing planning units or creating a new feature then show the identify features for the clicked point
  if (!dialogsState.puEditing && !this.map.getSource("mapbox-gl-draw-cold")) {
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
    const puFeatures = getFeaturesByLayerStartsWith(clickedFeatures, "marxan_pu_");
    if (puFeatures.length && puFeatures[0].properties.puid){
      await getPUData(puFeatures[0].properties.puid);
    }
    setDialogsState(prevState => ({ ...prevState, popup_point: e.point }));

    // Get any conservation features under the mouse
    // Might be dupliate conservation features (e.g. with GBIF data) so get a unique list of sourceLayers
    // Get the full features data from the state.projectFeatures array

    let identifyFeatures = getFeaturesByLayerStartsWith(clickedFeatures, "marxan_feature_layer_");
    const uniqueSourceLayers = Array.from(new Set(identifyFeatures.map(item => item.sourceLayer)));   
    identifyFeatures = uniqueSourceLayers.map(sourceLayer => 
      dialogsState.projectFeatures.find(feature => feature.feature_class_name === sourceLayer)
    );

    //get any protected area features under the mouse
    const identifyProtectedAreas = getFeaturesByLayerStartsWith(clickedFeatures, "marxan_wdpa_");
    
    //set the state to populate the identify popup
    setDialogsState(prevState => ({ ...prevState,
      identifyVisible: true,
      identifyFeatures: identifyFeatures,
      identifyProtectedAreas: identifyProtectedAreas,
    }));
  }
}

//called when layers are added/removed or shown/hidden
const mapStyleChanged = (e) => updateLegend();
  
//after a layer has been added/removed/shown/hidden update the legend items
const updateLegend = () => {
  // Get the visible Marxan layers
  const visibleLayers = this.map.getStyle().layers
    .filter(layer => layer.id.startsWith("marxan_") && layer.layout.visibility === "visible");
  setDialogsState(prevState => ({ ...prevState, visibleLayers: visibleLayers }));
};

//gets a set of features that have a layerid that starts with the passed text
const getFeaturesByLayerStartsWith = (features, startsWith) => features.filter(item => item.layer.id.startsWith(startsWith));

//gets a list of features for the planning unit
const getPUData = async (puid) => {
  const response = await _get(`getPUData?user=${dialogsState.owner}&project=${dialogsState.project}&puid=${puid}`);
  if (response.data.features.length) {
    //if there are some features for the planning unit join the ids onto the full feature data from the state.projectFeatures array
    joinArrays(response.data.features, dialogsState.projectFeatures, "species", "id");
  }
  //set the state to update the identify popup
  setDialogsState(prevState => ({ ...prevState,
    identifyPlanningUnits: {
      puData: response.data.pu_data,
      features: response.data.features,
    },
  }));
}

//joins a set of data from one object array to another
const joinArrays = (arr1, arr2, leftId, rightId) => {
  return arr1.map(item1 => {
    // Find the matching item in the second array
    const matchingItem = arr2.find(item2 => item2[rightId] === item1[leftId]);
    // Merge the items if a match is found
    return matchingItem ? { ...item1, ...matchingItem } : item1;
  });
};

//hides the identify popup
const hideIdentifyPopup = (e) => setDialogsState(prevState => ({ ...prevState, identifyVisible: false, identifyPlanningUnits: {} }));

//gets a Mapbox Style Specification JSON object from the passed ESRI style endpoint
const getESRIStyle = async (styleUrl) => {
  // Fetch the style JSON
  const response = await fetch(styleUrl);
  const style = await response.json();
  
  // Fetch metadata for the raw tiles
  const TileJSON = style.sources.esri.url;
  const metadataResponse = await fetch(TileJSON);
  const metadata = await metadataResponse.json();
  
  // Construct the tiles URL
  const tilesurl = metadata.tiles[0].startsWith("/") ? TileJSON + metadata.tiles[0] : TileJSON + "/" + metadata.tiles[0];
  
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
}

//sets the basemap either on project load, or if the user changes it
const setBasemap = async (basemap) => {
  try {
      console.log("setBasemap ", basemap);
  setDialogsState(prevState => ({...prevState, basemap: basemap.name}));
  // Get a valid map style
  const style = await getValidStyle(basemap);
  await loadMapStyle(style);
  // Add the WDPA layer
  addWDPASource();
  addWDPALayer();
  
  // Add the planning unit layers (if a project has already been loaded)
  if (dialogsState.tileset) {
    addPlanningGridLayers(dialogsState.tileset);
    
    // Get the results, if any
    if (dialogsState.owner) {
      await getResults(dialogsState.owner, dialogsState.project);
    }
    
    // Turn on/off layers depending on which tab is selected
    if (dialogsState.activeTab === "planning_units") {
      pu_tab_active();
    }
  }
  } catch (error) {
    console.error("Error setting basemap:", error);
  }
}
 
//gets the style JSON either as a valid TileJSON object or as a url to a valid TileJSON object
const getValidStyle = async (basemap) => {
  switch (basemap.provider) {
    case "esri":
      // Load the ESRI style dynamically and return the parsed TileJSON object
      return await getESRIStyle(basemap.id);
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

//loads the maps style using either a url to a Mapbox Style Specification file or a JSON object
const loadMapStyle = async (style) => {
  if (!this.map) {
    createMap(style);
  } else {
    // Request the style
    this.map.setStyle(style, { diff: false });
  }

  return new Promise((resolve) => {
    this.map.on("style.load", () => {
      resolve("Map style loaded");
    });
  });
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
    setDialogsState((prevState) => ({
      ...prevState,
      tileset: tileset,
    }));

    return tileset;
  } catch (error) {
    setSnackBar(error);
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
  this.map.addSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME, {
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
  setDialogsState(prevState => ({ ...prevState,
    resultsLayer: this.map.getLayer(CONSTANTS.RESULTS_LAYER_NAME),
  }));
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
}

const removePlanningGridLayers = () => {
  const sourceName = CONSTANTS.PLANNING_UNIT_SOURCE_NAME;
  let layers = this.map.getStyle().layers;
  // Get dynamically added layers, remove them, and then remove sources
  const dynamicLayers = layers.filter((item) => item.source === sourceName);
  dynamicLayers.forEach((item) => removeMapLayer(item.id));
  if (this.map.getSource(sourceName)){
    this.map.removeSource(sourceName);
  }
}

//adds the WDPA vector tile layer source - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
const addWDPASource = () => {
  //add the source for the wdpa
  const yr = marxanServer.wdpa_version.substr(-4); //get the year from the wdpa_version
  const attribution =`IUCN and UNEP-WCMC (${yr}), The World Database on Protected Areas (WDPA) ${marxanServer.wdpa_version}, Cambridge, UK: UNEP-WCMC. Available at: <a href='http://www.protectedplanet.net'>www.protectedplanet.net</a>`;
  
  const tiles = [
    `${dialogsState.registry.WDPA.tilesUrl}layer=marxan:${layer}&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}`,
  ];
  
  setDialogsState(prevState => ({ ...prevState, wdpaAttribution: attribution }));
  this.map.addSource(CONSTANTS.WDPA_SOURCE_NAME, {
    attribution: attribution,
    type: "vector",
    tiles: tiles,
  });
}

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
  setDialogsState(prevState => ({ ...prevState, wdpaLayer: this.map.getLayer(CONSTANTS.WDPA_LAYER_NAME) }));
}

const toggleLayerVisibility = (id, visibility) => {
  if (this.map?.getLayer(id))
    this.map.setLayoutProperty(id, "visibility", visibility);
};

const showLayer =(id) => toggleLayerVisibility(id, "visible");

const hideLayer = (id) =>   toggleLayerVisibility(id, "none");

//centralised code to add a layer to the maps current style
const addMapLayer = (mapLayer, beforeLayer) => {
  // If a beforeLayer is not passed get the first symbol layer (i.e. label layer) 
  const layers = this.map.getStyle().layers;
  const beforeLayer = beforeLayerId || layers.find(layer => layer.type === "symbol")?.id || null;

  // Add the layer to the map
  this.map.addLayer(mapLayer, beforeLayer);
}
  
//centralised code to remove a layer from the maps current style
const removeMapLayer = (layerid) => this.map.removeLayer(layerid);

const isLayerVisible = (layername) =>(
  this.map &&
  this.map.getLayer(layername) &&
  this.map.getLayoutProperty(layername, "visibility") === "visible"
);

//changes the layers opacity
const changeOpacity = (layerId, opacity) => {
  if (this.map) {
    let layer = this.map.getLayer(layerId);
    switch (layer.type) {
      case "circle":
        this.map.setPaintProperty(layerId, "circle-opacity", opacity);
        break;
      case "fill":
        this.map.setPaintProperty(layerId, "fill-opacity", opacity);
        break;
      case "line":
        this.map.setPaintProperty(layerId, "line-opacity", opacity);
        break;
      default:
        // code
    }
  }
}

//sets the metadata for the layer
const setLayerMetadata = (layerId, metadata) => {
  const layer = this.map.getLayer(layerId);
  if (layer) {
    // Use spread operator to merge metadata
    layer.metadata = { ...layer.metadata, ...metadata };
  }
};


//gets a particular set of layers based on the layer types (layerTypes is an array of layer types)
const getLayers = (layerTypes) => {
  const allLayers = this.map.getStyle().layers;

  return allLayers.filter(({ metadata }) => 
    metadata?.type && layerTypes.includes(metadata.type)
  );
};

//shows/hides layers of a particular type (layerTypes is an array of layer types)
const showHideLayerTypes = (layerTypes, show) => {
  const layers = getLayers(layerTypes);
  layers.forEach((layer) => (show) ? showLayer(layer.id) : hideLayer(layer.id));
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// TABS
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

//fired when the projects tab is selected
const project_tab_active = () => {
  setDialogsState(prevState => ({ ...prevState, activeTab: "project" }));
  pu_tab_inactive();
}

//fired when the features tab is selected
const features_tab_active = () => {
  if (dialogsState.activeTab !== "features") {
    setDialogsState(prevState => ({ ...prevState, activeTab: "features" }));
    //render the sum solution map
    // this.renderSolution(this.runMarxanResponse.ssoln, true);
    //hide the planning unit layers
    pu_tab_inactive();
  }
}

//fired when the planning unit tab is selected
const pu_tab_active = async () => {
  setDialogsState(prevState => ({ ...prevState, activeTab: "planning_units" }));
  //show the planning units layer, status layer, and costs layer
  showLayer(CONSTANTS.PU_LAYER_NAME);
  showLayer(CONSTANTS.STATUS_LAYER_NAME);
  await loadCostsLayer();
  //hide the results layer, feature layer, and feature puid layers
  hideLayer(CONSTANTS.RESULTS_LAYER_NAME);
  showHideLayerTypes([
      CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
      CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
  ], false);
  //render the planning units status layer_edit layer
  renderPuEditLayer(CONSTANTS.STATUS_LAYER_NAME);
}

//fired whenever another tab is selected
const pu_tab_inactive = () => {
  //show the results layer, eature layer, and feature puid layers
  showLayer(CONSTANTS.RESULTS_LAYER_NAME);
  showHideLayerTypes([
    CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
    CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
  ], true);
  //hide the planning units layer, edit layer, and cost layer
  hideLayer(CONSTANTS.PU_LAYER_NAME);
  hideLayer(CONSTANTS.STATUS_LAYER_NAME);
  hideLayer(CONSTANTS.COSTS_LAYER_NAME);
}

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
    setDialogsState(prevState => ({ ...prevState, puEditing: true }));
    //set the cursor to a crosshair
    this.map.getCanvas().style.cursor = "crosshair";
    //add the left mouse click event to the planning unit layer
    this.onClickRef = moveStatusUp; //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("click", CONSTANTS.PU_LAYER_NAME, this.onClickRef);
    //add the mouse right click event to the planning unit layer
    this.onContextMenu = resetStatus; //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("contextmenu", CONSTANTS.PU_LAYER_NAME, this.onContextMenu);
  }

const stopPuEditSession = () => {
  //set the state
  setDialogsState(prevState => ({ ...prevState, puEditing: false }));
  //reset the cursor
  this.map.getCanvas().style.cursor = "pointer";
  //remove the mouse left click event
  this.map.off("click", CONSTANTS.PU_LAYER_NAME, onClickRef);
  //remove the mouse right click event
  this.map.off("contextmenu", CONSTANTS.PU_LAYER_NAME, onContextMenu);
  //update the pu.dat file
  updatePuDatFile();
}

//clears all of the manual edits from the pu edit layer (except the protected area units)
const clearManualEdits = () => {
  // Clear all the planning unit statuses
  setDialogsState(prevState => ({ ...prevState, planning_units: [] }));
  // Get the puids for the current IUCN category
  const puids = getPuidsFromIucnCategory(dialogsState.metadata.IUCN_CATEGORY);
  // Update the planning units
  updatePlanningUnits([], puids);
};

//sends a list of puids that should be excluded from the run to upddate the pu.dat file
const updatePuDatFile = async () => {
  //initialise the form data
  let formData = new FormData();
  formData.append("user", dialogsState.owner);
  formData.append("project", dialogsState.project);
  //add the planning unit manual exceptions
  if (dialogsState.planning_units.length > 0) {
    dialogsState.planning_units.forEach((item) => formData.append(`status${item[0]}`, item[1]));
  }  
  //post to the server
  await _post("updatePUFile", formData);
}

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
    const statuses = [...dialogsState.planning_units];
    // If planning unit is not level 0 (in which case it will not be in the planning_units state) - remove it from the puids array for that status
    if (status !== 0) removePuidFromArray(statuses, status, puid);
    //add it to the new status array
    if (next_status !== 0) addPuidToArray(statuses, next_status, puid);
    //set the state
    setDialogsState(prevState => ({ ...prevState, planning_units: statuses }));
    //re-render the planning unit edit layer
    renderPuEditLayer();
  }
}

const getStatusLevel = (puid) => {
  //iterate through the planning unit statuses to see which status the clicked planning unit belongs to, i.e. 1, 2 or 3
  return (
    CONSTANTS.PLANNING_UNIT_STATUSES.find((status) => 
      getPlanningUnitsByStatus(status).includes(puid)
    ) || 0)
}

//gets the array index position for the passed status in the planning_units state
const getStatusPosition = (status) => dialogsState.planning_units.findIndex(item => item[0] === status);

//returns the planning units with a particular status, e.g. 1,2,3
const getPlanningUnitsByStatus = (status) => {
  //get the position of the status items in the dialogsState.planning_units
  let position = getStatusPosition(status);
  //get the array of planning units
  return (position > -1) ? dialogsState.planning_units[position][1] : [];
}

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
}

// removes in individual puid value from an array of puid statuses
const removePuidFromArray = (statuses, status, puid) => removePuidsFromArray(statuses, status, [puid]);

const addPuidToArray = (statuses, status, puid) => appPuidsToPlanningUnits(statuses, status, [puid]);

//adds all the passed puids to the planning_units state
const appPuidsToPlanningUnits = (statuses, status, puids) => {
  //get the position of the status items in the dialogsState.planning_units, i.e. the index
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
}

//removes all the passed puids from the planning_units state
const removePuidsFromArray = (statuses, status, puids) => {
  //get the position of the status items in the dialogsState.planning_units
  const position = getStatusPosition(status);
  if (position > -1) {
    let puidArray = statuses[position][1];
    let filteredArray = puidArray.filter((item) => puids.indexOf(item) < 0);
    statuses[position][1] = filteredArray 
    //if there are no more items in the puid array then remove it
    if (filteredArray.length === 0) statuses.splice(position, 1);
  }
  return statuses;
}

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
const previewPlanningGrid = (planning_grid_metadata) => setDialogsState(prevState => ({ 
  ...prevState,
  planning_grid_metadata: planning_grid_metadata,
  planningGridDialogOpen: true,
}));

//creates a new planning grid unit
const createNewPlanningUnitGrid = async (iso3, domain, areakm2, shape) => {
  startLogging();
  const message = await _ws(`createPlanningUnitGrid?iso3=${iso3}&domain=${domain}&areakm2=${areakm2}&shape=${shape}`, wsMessageCallback);
  await newPlanningGridCreated(message);
  setDialogsState(prevState => ({ ...prevState, NewPlanningGridDialogOpen: false }));
}

//creates a new planning grid unit
const createNewMarinePlanningUnitGrid = async (filename, planningGridName, areakm2, shape) => {
  startLogging();
  const message = await _ws(`createMarinePlanningUnitGrid?filename=${filename}&planningGridName=${planningGridName}&areakm2=${areakm2}&shape=${shape}`, wsMessageCallback)
  await newMarinePlanningGridCreated(message);
  setDialogsState(prevState => ({ ...prevState, NewMarinePlanningGridDialogOpen: false }));
}

//imports a zipped shapefile as a new planning grid
const importPlanningUnitGrid = async (zipFilename, alias, description) => {
  try {
    startLogging();
    messageLogger({
      method: "importPlanningUnitGrid",
      status: "Started",
      info: "Importing planning grid..",
    });
    const response = await importZippedShapefileAsPu(zipFilename, alias, description)
    messageLogger({
      method: "importPlanningUnitGrid",
      status: "Finished",
      info: response.info,
    });
    await newPlanningGridCreated(response);
    setDialogsState(prevState => ({ ...prevState, importPlanningGridDialogOpen: false }));
  } catch (error) {
    deletePlanningUnitGrid(alias, true);
    messageLogger({
      method: "importPlanningUnitGrid",
      status: "Finished",
      error: error,
    });
    throw error;
  }
}

//called when a new planning grid has been created
const newPlanningGridCreated = (response) => {
  await pollMapbox(response.uploadId);
  await getPlanningUnitGrids();
}

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
}

//deletes a planning grid
const deletePlanningGrid = async (feature_class_name, silent) => {
  const response = await _get(`deletePlanningUnitGrid?planning_grid_name=${feature_class_name}`);
  //update the planning unit grids
  await getPlanningUnitGrids();
  setSnackBar(response.info, silent);
}

//exports a planning grid to a zipped shapefile
const exportPlanningGrid = async (feature_class_name) => {
  try {
    const response = await _get(`exportPlanningUnitGrid?name=${feature_class_name}`);
    return `${dialogsState.marxanServer.endpoint}exports/${response.filename}`;
  } catch (error) {
    throw new Error("Failed to export planning grid");
  }
}


//gets a list of projects that use a particular planning grid
const getProjectsForPlanningGrid = async (feature_class_name) => await _get(`listProjectsForPlanningGrid?feature_class_name=${feature_class_name}`);

const getCountries= async () =>  {
  const response = await _get("getCountries")
  setDialogsState(prevState => ({ ...prevState, countries: response.records }));
}

//uploads the named feature class to mapbox on the server
const uploadToMapBox = async (feature_class_name, mapbox_layer_name) => {
  try {
    const response = _get(`uploadTilesetToMapBox?feature_class_name=${feature_class_name}&mapbox_layer_name=${mapbox_layer_name}`,300000)
    setDialogsState(prevState => ({ ...prevState, loading: true }));
    const poll = await pollMapbox(response.uploadid);
    return poll;
  } catch (error) {
    console.error();
    throw error;
  }
}

const pollStatus = async (uploadid) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/uploads/v1/${CONSTANTS.MAPBOX_USER}/${uploadid}?access_token=${dialogsState.registry.MBAT}`
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
      setSnackBar(errorMsg);
      clearMapboxTimer(uploadid);
      throw new Error(result.error);
    }
  } catch (error) {
    setDialogsState(prevState => ({ ...prevState, uploading: false }));
    throw error;
  }
};
//polls mapbox to see when an upload has finished - returns as promise
const pollMapbox = async (uploadid) => {
  setDialogsState(prevState => ({ ...prevState, uploading: true }));
  messageLogger({ info: "Uploading to Mapbox..", status: "Uploading" });
  
  if (uploadid === "0") {
    messageLogger({
      info: "Tileset already exists on Mapbox",
      status: "UploadComplete",
    });
    //reset state
    setDialogsState(prevState => ({ ...prevState, uploading: false }));
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
}
//resets a timer for a mapbox upload poll
const clearMapboxTimer = (uploadid) => {
  //clear the timer
  const timerToClear = timers.find((timer) => timer.uploadid === uploadid);
  clearInterval(timerToClear.timer);
  //remove the timer from the timers array
  timers = timers.filter((timer) => timer.uploadid !== uploadid);
  if (timers.length === 0) setDialogsState(prevState => ({ ...prevState, uploading: false }));
}

const openWelcomeDialog =() => {
  parseNotifications();
  setDialogsState(prevState => ({ ...prevState, welcomeDialogOpen: true }));
}

const openFeaturesDialog = async (showClearSelectAll) => {
  // Refresh features list if we are using a hosted service (other users could have created/deleted items) and the project is not imported (only project features are shown)
  if (dialogsState.marxanServer.system !== "Windows" && !dialogsState.metadata.OLDVERSION) {
    await refreshFeatures();
  }
  setDialogsState(prevState => ({ ...prevState,
    featuresDialogOpen: true,
    addingRemovingFeatures: showClearSelectAll,
  }));
  if (showClearSelectAll) {
    getSelectedFeatureIds();
  }
}

const updateState = (state_obj) => setDialogsState(prevState => ({...prevState, ...state_obj}));

const closeNewFeatureDialog = ()=> {
  setDialogsState(prevState => ({ ...prevState, NewFeatureDialogOpen: false }));
  //finalise digitising
  finaliseDigitising();
}

const openPlanningGridsDialog = () => {
  //refresh planning grids if using a hosted service - other users could have created/deleted items
  if (dialogsState.marxanServer.system !== "Windows") {
    getPlanningUnitGrids();
  }
  setDialogsState(prevState => ({ ...prevState, planningGridsDialogOpen: true }));
}

//used by the import wizard to import a users zipped shapefile as the planning units
//the zipped shapefile has been uploaded to the MARXAN folder - it will be imported to PostGIS and a record will be entered in the metadata_planning_units table
const importZippedShapefileAsPu = async (zipname, alias, description) => await _get(`importPlanningUnitGrid?filename=${zipname}&name=${alias}&description=${description}`);

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// CUMULATIVE IMPACT
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
const openAtlasLayersDialog = () => {
  if (dialogsState.atlasLayers.length < 1) {
    getAtlasLayers();
  }
  setDialogsState(prevState => ({ ...prevState, atlasLayersDialogOpen: true }));
}

const openCumulativeImpactDialog = async () => {
  await getImpacts();
  setDialogsState(prevState => ({ ...prevState, cumulativeImpactDialogOpen: true }));
}

//makes a call to get the impacts from the server and returns them
const getImpacts = async () => {
  console.log("getting impacts...");
  const response = await _get("getAllImpacts");
  setDialogsState(prevState => ({ ...prevState, allImpacts: response.data}));
}

const getOceanBaseMap = () => {
  this.map.addSource("Ocean Base", {
    type: "raster",
    tiles: [
      "http://atlas.marine.ie/mapserver/?map=C:/MapServer/apps/miatlas/AdministrativeUnits_wms.map&service=WMS&request=GetMap&format=image/png&transparent=true&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}",
    ],
    tileSize: 256,
  });
  this.map.addLayer({
    id: "Ocean Base",
    type: "raster",
    source: "Ocean Base",
    layout: {
      // make layer visible by default
      visibility: "none",
    },
  });
  // setDialogsState(prevState => ({ ...prevState, map: map });
}

const getAtlasLayers = async () => {
  try {
    const response = await fetch(
      dialogsState.marxanServer.endpoint + "getAtlasLayers",
      { credentials: "include" }
    );
    const data = await response.json();
    
    const parseddata = data.map(JSON.parse);
    
    parsedData.forEach(layer => {
      const sourceName = layer.layer;
      const tileUrl = `http://www.atlas-horizon2020.eu/gs/ows?layers=${sourceName}&service=WMS&request=GetMap&format=image/png&transparent=true&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}`;

      // Add the source to the map
      this.map.addSource(sourceName, {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
      });

      // Add the layer to the map
      this.map.addLayer({
        id: sourceName,
        type: "raster",
        source: sourceName,
        layout: {
          visibility: "none", // make layer invisible by default
        },
      });
    });
    setDialogsState(prevState => ({ ...prevState, atlasLayers: parseddata }));
  } catch (error) {
    console.error("Failed to fetch and add Atlas layers:", error);
  }
}

const openImportedActivitesDialog = async () => {
  await getUploadedActivities();
  setDialogsState(prevState => ({ ...prevState, importedActivitiesDialogOpen: true }));
}

const openCostsDialog = () => {
  getImpacts();
  setDialogsState(prevState => ({ ...prevState, costsDialogOpen: true }));
}

const getUploadedActivities = async () => {
  const response = await _get("getUploadedActivities")
  setDialogsState(prevState => ({ ...prevState, uploadedActivities: response.data, fetched: true }));
}

const clearSelactedLayers = () => {
  const layers = [...dialogsState.selectedLayers];
  layers.forEach((layer) => setselectedLayers(layer));
  closeAtlasLayersDialog();
}

const setselectedLayers = (layer) => {
  // Determine the new visibility
  const currentVisibility = this.map.getLayoutProperty(layer, "visibility");
  const newVisibility = currentVisibility === "visible" ? "none" : "visible";
  
  // Update the layer's visibility
  this.map.setLayoutProperty(layer, "visibility", newVisibility);
  
  // Update the selectedLayers state
  setDialogsState(prevState => {
    const isLayerSelected = prevState.selectedLayers.includes(layer);
    return {
      selectedLayers: isLayerSelected
        ? prevState.selectedLayers.filter(item => item !== layer)
        : [...prevState.selectedLayers, layer],
    };
  });
}

const closeAtlasLayersDialog = () => setDialogsState(prevState => ({ ...prevState, atlasLayersDialogOpen: false }));

//when a user clicks a impact in the ImpactsDialog
const clickImpact = (impact, event, previousRow) => {
  dialogsState.selectedImpactIds.includes(impact.id)
    ? removeImpact(impact)
    : addImpact(impact);
  toggleImpactLayer(impact);
}

//adds a impact to the selectedImpactIds array
const addImpact = (impact) => setDialogsState((prevState) => ({selectedImpactIds: [...prevState.selectedImpactIds, impact.id]}));

//removes a impact from the selectedImpactIds array
const removeImpact = (impact) => {
  setDialogsState((prevState) => ({
    selectedImpactIds: prevState.selectedImpactIds.filter(
      (imp) => imp !== impact.id
    ),
  }));
}

//toggles the impact layer on the map
const toggleImpactLayer = (impact) => {
  if (impact.tilesetid === "") {
    setSnackBar(`This impact does not have a tileset on Mapbox. See <a href='${CONSTANTS.ERRORS_PAGE}#the-tileset-from-source-source-was-not-found' target='blank'>here</a>`);
    return;
  }
  // this.closeImpactMenu();
  const layerName = impact.tilesetid.split(".")[1];
  const layerId = "marxan_impact_layer_" + layerName;
  
  if (this.map.getLayer(layerId)) {
    removeMapLayer(layerId);
    this.map.removeSource(layerId);
    updateImpact(impact, { impact_layer_loaded: false });
  } else {
    //if a planning units layer for a impact is visible then we need to add the impact layer before it - first get the impact puid layer
    const layers = getLayers([CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER]);
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
          `https://api.mapbox.com/v4/${impact.tilesetid}/{z}/{x}/{y}.png256?access_token=pk.eyJ1IjoiY3JhaWNlcmphY2siLCJhIjoiY2syeXhoMjdjMDQ0NDNnbDk3aGZocWozYiJ9.T-XaC9hz24Gjjzpzu6RCzg`
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
}

//gets the ids of the selected impacts
const getSelectedImpactIds = () => {
  // Use map and filter to get selected impact IDs in one line
  const ids = dialogsState.allImpacts
    .filter(impact => impact.selected)
    .map(impact => impact.id);

  // Update the state with the selected impact IDs
  setDialogsState(prevState => ({ ...prevState, selectedImpactIds: ids }));
};

//updates the properties of a impact and then updates the impacts state
const updateImpact = (impact, newProps) => {
  const impacts = [...dialogsState.allImpacts];
  //get the position of the impact
  const index = impacts.findIndex((element) => element.id === impact.id);
  
  if (index !== -1) {
    allImpacts[index] = { ...allImpacts[index], ...newProps };
    //update allImpacts and projectImpacts with the new value
    setDialogsState(prevState => ({ 
      ...prevState, 
      allImpacts: newImpacts, 
      projectImpacts: newImpacts.filter((item) => item.selected)
    }));
  }
}

const openHumanActivitiesDialog = async () => {
  if (dialogsState.activities.length < 1) {
    const response = await _get("getActivities");
    const data = await JSON.parse(response.data)
    setDialogsState(prevState => ({ ...prevState, activities: data, fetched: true }));
  }
  setDialogsState(prevState => ({ ...prevState, humanActivitiesDialogOpen: true }));
}

const closeHumanActivitiesDialog =() => setDialogsState(prevState => ({ ...prevState, humanActivitiesDialogOpen: false }));

//create new impact from the created pressures
const importImpacts = async(filename, selectedActivity, description) => {
  //start the logging
  setDialogsState(prevState => ({ ...prevState, loading: true }));
  startLogging();
  
  const url = `runCumumlativeImpact?filename=${filename}&activity=${selectedActivity}&description=${description}`;
  const message = await _ws(url, wsMessageCallback);
  await pollMapbox(message.uploadId)
  setDialogsState(prevState => ({ ...prevState, loading: false }));
  return "Cumulative Impact Layer uploaded";
}

const runCumulativeImpact = async (selectedUploadedActivityIds) => {
  setDialogsState(prevState => ({ ...prevState, loading: true }));
  startLogging();
  
  await _ws(`runCumumlativeImpact?selectedIds=${selectedUploadedActivityIds}`, wsMessageCallback);
  setDialogsState(prevState => ({ ...prevState, loading: false }));
  return "Cumulative Impact Layer uploaded";
}

const uploadRaster = async (data) => {
  setDialogsState(prevState => ({ ...prevState, loading: true }));
  messageLogger({
    method: "uploadRaster",
    status: "In Progress",
    info: "Uploading Raster...",
  });
  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));
  
  //the binary data for the file, the filename
  const response = await _post("uploadRaster", formData);
  console.log("response ", response);
  return response;
}

const openActivitiesDialog = async () => {
  await getUploadedActivities();
  setDialogsState(prevState => ({ ...prevState, activitiesDialogOpen: true }));
}

//create new impact from the created pressures
const saveActivityToDb = async (filename, selectedActivity, description) => {
  //start the logging
  setDialogsState(prevState => ({ ...prevState, loading: true }));
  startLogging();
  const url =`saveRaster?filename=${filename}&activity=${selectedActivity}&description=${description}`;
  await _ws(url, wsMessageCallback);
  setDialogsState(prevState => ({ ...prevState, loading: false }));
  return "Raster saved to db";
}

const createCostsFromImpact = async (data) => {
  setDialogsState(prevState => ({ ...prevState, loading: true }));
  startLogging();
  const url =`createCostsFromImpact?user=${dialogsState.owner}&project=${dialogsState.project}&pu_filename=${dialogsState.metadata.PLANNING_UNIT_NAME}&impact_filename=${data.feature_class_name}&impact_type=${data.alias}`;
  await _ws(url, wsMessageCallback)
  setDialogsState(prevState => ({ ...prevState, loading: false }));
  addCost(data.alias);
  return "Costs created from Cumulative impact";
}

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
  let features = [...dialogsState.allFeatures];
  const index = features.findIndex(element => element.id === feature.id);
  if (index !== -1) {
    features[index] = { ...features[index], ...newProps };
    setFeaturesState(features);
  }
}

//gets the ids of the selected features
const getSelectedFeatureIds = () => {
  const selectedFeatureIds = dialogsState.allFeatures
    .filter((feature) => feature.selected)
    .map((feature) => feature.id);

  setDialogsState((prevState) => ({
    ...prevState,
    selectedFeatureIds: selectedFeatureIds,
  }));
};

//when a user clicks a feature in the FeaturesDialog
const clickFeature = (feature) => {
  return ([...dialogsState.selectedFeatureIds].includes(feature.id)) ? removeFeature(feature) : addFeature(feature);
}

//removes a feature from the selectedFeatureIds array  
const removeFeature = (feature) => {
  const updatedFeatureIds = dialogsState.selectedFeatureIds.filter(id => id !== feature.id);
  setDialogsState(prevState => ({
    ...prevState,
    selectedFeatureIds: updatedFeatureIds
  }));
};

//adds a feature to the selectedFeatureIds array
const addFeature = (feature) => setDialogsState(prevState => ({ ...prevState, selectedFeatureIds: [...dialogsState.selectedFeatureIds, feature.id] }));

//starts a digitising session
const initialiseDigitising = () => {
  // Show digitising controls if not already present, mapbox-gl-draw-cold + mapbox-gl-draw-hot
  if (!this.map.getSource("mapbox-gl-draw-cold"))
    this.map.addControl(this.mapboxDrawControls);
}

//finalises the digitising
const finaliseDigitising = () => this.map.removeControl(this.mapboxDrawControls);

//called when the user has drawn a polygon on screen
const polygonDrawn = (evt) => {
  //open the new feature dialog for the metadata
  updateState({ NewFeatureDialogOpen: true });
  //save the feature in a local variable
  this.digitisedFeatures = evt.features;
}

//selects all the features
const selectAllFeatures = () =>  updateState({ selectedFeatureIds: dialogsState.allFeatures.map((feature) => feature.id) });

//updates the allFeatures to set the various properties based on which features have been selected in the FeaturesDialog or programmatically
const updateSelectedFeatures= async ()=> {
  //delete the gap analysis as the features within the project have changed
  await deleteGapAnalysis();
  const allFeatures = dialogsState.allFeatures.map(feature => {
    // Update feature selection status
    if (dialogsState.selectedFeatureIds.includes(feature.id)) {
      return { ...feature, selected: true };
    }

    // Handle features based on version
    if (dialogsState.metadata.OLDVERSION) {
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
  });

  // Apply updates to state
  setFeaturesState(allFeatures, () => {
    // Persist changes to the server if the user is not read-only
    if (dialogsState.userData.ROLE !== "ReadOnly") {
      updateSpecFile();
    }
    // Close dialogs
    updateState({
      featuresDialogOpen: false,
      newFeaturePopoverOpen: false,
      importFeaturePopoverOpen: false,
    });
  });

  // Remove layers if loaded
  allFeatures.forEach(feature => {
    if (feature.feature_layer_loaded) toggleFeatureLayer(feature);
    if (feature.feature_puid_layer_loaded) toggleFeaturePUIDLayer(feature);
  });
}

//updates the target values for all features in the project to the passed value
const updateTargetValueForFeatures = (target_value) => {
  const allFeatures = dialogsState.allFeatures.map(feature => ({
    ...feature,
    target_value
  }));

  // Set the features in app state
  setFeaturesState(allFeatures, () => {
    // Persist the changes to the server
    if (dialogsState.userData.ROLE !== "ReadOnly") {
      this.updateSpecFile();
    }
  });
};


//the callback is optional and will be called when the state has updated
const setFeaturesState = (newFeatures) => {
  setDialogsState(prevState => ({
    ...prevState,
    allFeatures: newFeatures,
    projectFeatures: newFeatures.filter(item => item.selected),
  }));
};


//unselects a single Conservation feature
const unselectItem = async (feature) => {
  removeFeature(feature)
  await updateSelectedFeatures();
}

//previews the feature
const previewFeature = (feature_metadata) => {
  setDialogsState(prevState => ({ ...prevState,
    feature_metadata: feature_metadata,
    featureDialogOpen: true,
  }));
}

//unzips a shapefile on the server
const unzipShapefile = async (filename) => await _get(`unzipShapefile?filename=${filename}`)

//deletes a zip file and shapefile (with the *.shp extension)
const deleteShapefile = async (zipfile, shapefile) => await _get(`deleteShapefile?zipfile=${zipfile}&shapefile=${shapefile}`);

//gets a list of fieldnames from the passed shapefile - this must exist in the servers root directory
const getShapefileFieldnames = async (filename) => await _get(`getShapefileFieldnames?filename=${filename}`);

//create new features from the already uploaded zipped shapefile
const importFeatures = (zipfile, name, description, shapefile, spiltfield) => {
  //start the logging
  startLogging();
  const baseUrl = `importFeatures?zipfile=${zipfile}&shapefile=${shapefile}`;
  const url = name !== ""
    ? `${baseUrl}&name=${name}&description=${description}`
    : `${baseUrl}&splitfield=${splitfield}`;
  const message = await _ws(url, wsMessageCallback);
  //get the uploadIds, get a promise array to see when all of the uploads are done
  const promiseArray = message.uploadIds.map(uploadId => await pollMapbox(uploadId));
  await Promise.all(promiseArray);
  return "All features uploaded";
}

//imports features from a web resource
const importFeaturesFromWeb = async (name, description, endpoint, srs, featureType) => {
  startLogging();
  const url = `createFeaturesFromWFS?name=${name}&description=${description}&endpoint=${endpoint}&srs=${srs}&featuretype=${featureType}`;

  const message = await _ws(url, wsMessageCallback);
  const uploadId = message.uploadId;
  return await pollMapbox(uploadId)
}

//import features from GBIF
const importGBIFData = async (item) => {
  startLogging();
  _ws(`importGBIFData?taxonKey=${item.key}&scientificName=${item.scientificName}`, wsMessageCallback);
  return await pollMapbox(message.uploadId);
}

//requests matching species names in GBIF
const gbifSpeciesSuggest = async (q) => {
  setDialogsState(prevState => ({ ...prevState, loading: true }));
  const response = await new Promise((resolve, reject) => {
      jsonp(`https://api.gbif.org/v1/species/suggest?q=${q}&rank=SPECIES`)
        .promise
        .then(resolve)
        .catch(reject);
    });

    // Update state and return the response
    setDialogsState(prevState => ({ ...prevState, loading: false }));
    return response;
}

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
    .map((coordinate) =>  coordinate[0] + " " + coordinate[1]).join(",");
  
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
}

//gets the new feature information and updates the state
const newFeatureCreated = async (id) => {
  const response = await _get(`getFeature?oid=${id}&format=json`);
  const feature = response.data[0];
  initialiseNewFeature(feature); // Add the required attributes and update the allFeatures array

  // If 'addToProject' is set, add the feature to the project
  if (dialogsState.addToProject) {
    addFeature(feature)
    await updateSelectedFeatures();
  }
};


//adds the required attributes to use it in Marxan Web and update the allFeatures array
const initialiseNewFeature = (feature) => {
  addFeatureAttributes(feature); // Add the required attributes to the feature
  addNewFeature(feature); // Add the new feature to the state
};

//adds a new feature to the allFeatures array
const addNewFeature = (feature) => {
  const featuresCopy = [...dialogsState.allFeatures, feature]; // Get the current list of features and add new
  // Sort the features alphabetically by alias
  featuresCopy.sort((a, b) => a.alias.localeCompare(b.alias, undefined, { sensitivity: 'base' }));
  setDialogsState(prevState => ({ ...prevState, allFeatures: featuresCopy }));
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
  setSnackBar("Failed to delete feature due to an error.");
}
};

//deletes a feature
const _deleteFeature = async (feature) => {
  const response = await _get(`deleteFeature?feature_name=${feature.feature_class_name}`);
  setSnackBar("Feature deleted");
  await removeFeature(feature);
  removeFeatureFromAllFeatures(feature) //remove it from the allFeatures array
}

//removes a feature from the allFeatures array
const removeFeatureFromAllFeatures = (feature) => {
setDialogsState(prevState => ({
  ...prevState,
  allFeatures: prevState.allFeatures.filter(item => item.id !== feature.id),
}));
};

//makes a call to get the features from the server and returns them
const getFeatures = async () => await _get("getAllSpeciesData");

// Gets all the features from the server and updates the state
const getAllFeatures = async () => {
const response = await getFeatures();
setDialogsState(prevState => ({ ...prevState, allFeatures: response.data }));
}

//gets the feature ids as a set from the allFeatures array
const getFeatureIds = (_features) => new Set(_features.map((item) => item.id));

//refreshes the allFeatures state
const refreshFeatures = async () => {
// Fetch the latest features
const response = await getFeatures();
const newFeatures = response.data;

// Extract existing and new feature IDs
const existingFeatureIds = getFeatureIds(dialogsState.allFeatures);
const newFeatureIds = getFeatureIds(newFeatures);

// Determine which features have been removed or added
const removedFeatureIds = [...existingFeatureIds].filter(id => !newFeatureIds.has(id));
const addedFeatureIds = [...newFeatureIds].filter(id => !existingFeatureIds.has(id));

// Remove features that are no longer present
removedFeatureIds.forEach(id => removeFeatureFromAllFeatures({ id }));

// Initialize new features
const addedFeatures = newFeatures.filter(feature => addedFeatureIds.includes(feature.id));
addedFeatures.forEach(feature => initialiseNewFeature(feature));
};

const openFeatureMenu = (evt, feature) => setDialogsState(prevState => ({ ...prevState, featureMenuOpen: true, currentFeature: feature, menuAnchor: evt.currentTarget }));

const closeFeatureMenu = (evt) => setDialogsState(prevState => ({ ...prevState, featureMenuOpen: false }));

//hides the feature layer
const hideFeatureLayer = () => {
dialogsState.projectFeatures.forEach((feature) => {
  if (feature.feature_layer_loaded) toggleFeatureLayer(feature);
});
}

//toggles the feature layer on the map
const toggleFeatureLayer = (feature) => {
if (feature.tilesetid === "") {
  setSnackBar(`This feature does not have a tileset on Mapbox. See <a href='${CONSTANTS.ERRORS_PAGE} #the-tileset-from-source-source-was-not-found' target='blank'>here</a>`);
  return;
}
// closeFeatureMenu();
const layerId = `marxan_feature_layer_${feature.tilesetid.split(".")[1]}`

if (this.map.getLayer(layerId)) {
  removeMapLayer(layerId);
  this.map.removeSource(layerId);
  updateFeature(feature, { feature_layer_loaded: false });
} else {
  // If a planning units layer for a feature is visible then we need to add the feature layer before it - first get the feature puid layer
  const layers = getLayers([CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER]);
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
}

//toggles the planning unit feature layer on the map
const toggleFeaturePUIDLayer = async (feature) => {
// closeFeatureMenu();
let layerName = `marxan_puid_${feature.id}`;

if (this.map.getLayer(layerName)) {
  removeMapLayer(layerName);
  updateFeature(feature, { feature_puid_layer_loaded: false });
} else {
  //get the planning units where the feature occurs
  const response = await _get(`getFeaturePlanningUnits?user=${dialogsSate.owner}&project=${dialogsState.project}&oid=${feature.id}`)
  
  addMapLayer({
    id: layerName,
    metadata: {
      name: feature.alias,
      type: CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      lineColor: feature.color,
    },
    type: "line",
    source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
    "source-layer": dialogsState.tileset.name,
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-opacity": CONSTANTS.FEATURE_PLANNING_GRID_LAYER_OPACITY,
    },
  });
  //update the paint property for the layer
  const line_color_expression = initialiseFillColorExpression("puid");
  
  response.data.forEach((puid) => line_color_expression.push(puid, feature.color));
  // Last value is the default, used where there is no data
  line_color_expression.push("rgba(0,0,0,0)");
  this.map.setPaintProperty(layerName, "line-color", line_color_expression);
  //show the layer
  showLayer(layerName);
  updateFeature(feature, { feature_puid_layer_loaded: true });
}
}

//removes the current feature from the project
const removeFromProject = (feature) => {
closeFeatureMenu();
unselectItem(feature);
}

//zooms to a features extent
const zoomToFeature = (feature) => {
closeFeatureMenu();
//transform from BOX(-174.173506487 -18.788241791,-173.86528589 -18.5190063499999) to [[-73.9876, 40.7661], [-73.9397, 40.8002]]
const points = feature.extent
  .substr(4, feature.extent.length - 5)
  .replace(/ /g, ",")
  .split(",");
//get the points as numbers
const nums = points.map((item) => Number(item));
this.map.fitBounds(
  [
    [nums[0], nums[1]],
    [nums[2], nums[3]],
  ],
  { padding: 100 }
  );
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// DIALOGS
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
  showUserMenu(e) {
    e.preventDefault();
    setDialogsState(prevState => ({ ...prevState, userMenuOpen: true, menuAnchor: e.currentTarget }));
  }
  hideUserMenu(e) {
    setDialogsState(prevState => ({ ...prevState, userMenuOpen: false }));
  }
  showHelpMenu(e) {
    e.preventDefault();
    setDialogsState(prevState => ({ ...prevState, helpMenuOpen: true, menuAnchor: e.currentTarget }));
  }
  hideHelpMenu(e) {
    setDialogsState(prevState => ({ ...prevState, helpMenuOpen: false }));
  }
  showToolsMenu(e) {
    e.preventDefault();
    setDialogsState(prevState => ({ ...prevState, toolsMenuOpen: true, menuAnchor: e.currentTarget }));
  }
  hideToolsMenu(e) {
    setDialogsState(prevState => ({ ...prevState, toolsMenuOpen: false }));
  }

  openProjectsDialog() {
    setDialogsState(prevState => ({ ...prevState, projectsDialogOpen: true }));
    this.getProjects();
  }

  openNewProjectWizardDialog() {
    getCountries();
    setDialogsState(prevState => ({ ...prevState, newProjectWizardDialogOpen: true }));
  }

  openNewPlanningGridDialog() {
    getCountries();
    setDialogsState(prevState => ({ ...prevState, NewPlanningGridDialogOpen: true }));
  }

  openUserSettingsDialog() {
    setDialogsState(prevState => ({ ...prevState, UserSettingsDialogOpen: true }));
    this.hideUserMenu();
  }

  openProfileDialog() {
    setDialogsState(prevState => ({ ...prevState, profileDialogOpen: true }));
    this.hideUserMenu();
  }

  openAboutDialog() {
    setDialogsState(prevState => ({ ...prevState, aboutDialogOpen: true }));
    this.hideHelpMenu();
  }

  openClassificationDialog() {
    setDialogsState(prevState => ({ ...prevState, classificationDialogOpen: true }));
  }
  closeClassificationDialog() {
    setDialogsState(prevState => ({ ...prevState, classificationDialogOpen: false }));
  }

  openUsersDialog() {
    handleGetUsers();
    setDialogsState(prevState => ({ ...prevState, usersDialogOpen: true }));
  }

  toggleInfoPanel() {
    setDialogsState(prevState => ({ ...prevState, infoPanelOpen: !dialogsState.infoPanelOpen }));
  }
  toggleResultsPanel() {
    setDialogsState(prevState => ({ ...prevState, resultsPanelOpen: !dialogsState.resultsPanelOpen }));
  }

  openRunLogDialog() {
    this.getRunLogs();
    this.startPollingRunLogs();
    setDialogsState(prevState => ({ ...prevState, runLogDialogOpen: true }));
  }
  closeRunLogDialog() {
    this.stopPollingRunLogs();
    setDialogsState(prevState => ({ ...prevState, runLogDialogOpen: false }));
  }
  openGapAnalysisDialog() {
    setDialogsState(prevState => ({ ...prevState, gapAnalysisDialogOpen: true, gapAnalysis: [] }));
    this.runGapAnalysis();
  }
  closeGapAnalysisDialog() {
    setDialogsState(prevState => ({ ...prevState, gapAnalysisDialogOpen: false, gapAnalysis: [] }));
  }
  openServerDetailsDialog() {
    setDialogsState(prevState => ({ ...prevState, serverDetailsDialogOpen: true }));
    this.hideHelpMenu();
  }
  closeServerDetailsDialog() {
    setDialogsState(prevState => ({ ...prevState, serverDetailsDialogOpen: false }));
  }
  openChangePasswordDialog() {
    this.hideUserMenu();
    setDialogsState(prevState => ({ ...prevState, changePasswordDialogOpen: true }));
  }
  closeChangePasswordDialog() {
    setDialogsState(prevState => ({ ...prevState, changePasswordDialogOpen: false }));
  }

  showProjectListDialog(
    projectList,
    projectListDialogTitle,
    projectListDialogHeading
  ) {
    setDialogsState(
      {
        projectList: projectList,
        projectListDialogTitle: projectListDialogTitle,
        projectListDialogHeading: projectListDialogHeading,
      },
      () => {
        updateState({ ProjectsListDialogOpen: true });
      }
    );
  }
  openTargetDialog() {
    setDialogsState(prevState => ({ ...prevState, targetDialogOpen: true }));
  }
  closeTargetDialog() {
    setDialogsState(prevState => ({ ...prevState, targetDialogOpen: false }));
  }
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// PROTECTED AREAS LAYERS
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

  changeIucnCategory(iucnCategory) {
    //update the state
    let _metadata = dialogsState.metadata;
    _metadata.IUCN_CATEGORY = iucnCategory;
    setDialogsState(prevState => ({ ...prevState, metadata: _metadata });
    //update the input.dat file
    this.updateProjectParameter("IUCN_CATEGORY", iucnCategory);
    //filter the wdpa vector tiles - NO LONGER USED
    // this.filterWdpaByIucnCategory(iucnCategory);
    //render the wdpa intersections on the grid
    this.renderPAGridIntersections(iucnCategory);
  }

  filterWdpaByIucnCategory(iucnCategory) {
    //get the individual iucn categories
    let iucnCategories = this.getIndividualIucnCategories(iucnCategory);
    //TODO FILTER THE WDPA CLIENT SIDE BY INTERSECTING IT WITH THE PLANNING GRID
    //filter the vector tiles for those iucn categories - and if the planning unit name has an iso3 country code - then use that as well. e.g. pu_ton_marine_hexagon_50 (has iso3 code) or pu_a4402723a92444ff829e9411f07e7 (no iso3 code)
    //let filterExpr = (dialogsState.metadata.PLANNING_UNIT_NAME.match(/_/g).length> 1) ? ['all', ['in', 'IUCN_CAT'].concat(iucnCategories), ['==', 'PARENT_ISO', dialogsState.metadata.PLANNING_UNIT_NAME.substr(3, 3).toUpperCase()]] : ['all', ['in', 'IUCN_CAT'].concat(iucnCategories)];
    let filterExpr = ["all", ["in", "iucn_cat"].concat(iucnCategories)]; // no longer filter by ISO code
    this.map.setFilter(CONSTANTS.WDPA_LAYER_NAME, filterExpr);
    //turn on/off the protected areas legend
    let layer = iucnCategory === "None" ? false : true;
    setDialogsState(prevState => ({ ...prevState, pa_layer_visible: layer });
  }

  getIndividualIucnCategories(iucnCategory) {
    let retValue = [];
    switch (iucnCategory) {
      case "None":
        retValue = [""];
        break;
      case "IUCN I-II":
        retValue = ["Ia", "Ib", "II"];
        break;
      case "IUCN I-IV":
        retValue = ["Ia", "Ib", "II", "III", "IV"];
        break;
      case "IUCN I-V":
        retValue = ["Ia", "Ib", "II", "III", "IV", "V"];
        break;
      case "IUCN I-VI":
        retValue = ["Ia", "Ib", "II", "III", "IV", "V", "VI"];
        break;
      case "All":
        retValue = [
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
        ];
        break;
      default:
    }
    return retValue;
  }

  //gets the puids for those protected areas that intersect the planning grid in the passed iucn category
  getPuidsFromIucnCategory(iucnCategory) {
    let intersections_by_category = this.getIntersections(iucnCategory);
    //get all the puids in this iucn category
    let puids = this.getPuidsFromNormalisedData(intersections_by_category);
    return puids;
  }

  //called when the iucn category changes - gets the puids that need to be added/removed, adds/removes them and updates the PuEdit layer
  async renderPAGridIntersections(iucnCategory) {
    await this.preprocessProtectedAreas(iucnCategory)
      .then((intersections) => {
        //get all the puids of the intersecting protected areas in this iucn category
        let puids = this.getPuidsFromIucnCategory(iucnCategory);
        //see if any of them will overwrite existing manually edited planning units - these will be in status 1 and 3
        let manuallyEditedPuids = this.getPlanningUnitsByStatus(1).concat(
          this.getPlanningUnitsByStatus(3)
        );
        let clashingPuids = manuallyEditedPuids.filter(
          (value) => -1 !== puids.indexOf(value)
        );
        if (clashingPuids.length > 0) {
          //remove them from the puids
          puids = puids.filter((item) => !clashingPuids.includes(item));
          this.setSnackBar(
            "Not all planning units have been added. See <a href='" +
              CONSTANTS.ERRORS_PAGE +
              "#not-all-planning-units-have-been-added' target='blank'>here</a>"
          );
        }
        //get all the puids for the existing iucn category - these will come from the previousPuids rather than getPuidsFromIucnCategory as there may have been some clashes and not all of the puids from getPuidsFromIucnCategory may actually be renderered
        //if the previousPuids are undefined then get them from the projects previousIucnCategory
        let previousPuids =
          this.previousPuids !== undefined
            ? this.previousPuids
            : this.getPuidsFromIucnCategory(this.previousIucnCategory);
        //set the previously selected puids
        this.previousPuids = puids;
        //and previousIucnCategory
        this.previousIucnCategory = iucnCategory;
        //rerender
        this.updatePlanningUnits(previousPuids, puids);
      })
      .catch((error) => {
        this.setSnackBar(error);
      });
  }

  //updates the planning units by reconciling the passed arrays of puids
  updatePlanningUnits(previousPuids, puids) {
    //copy the current planning units state
    let statuses = dialogsState.planning_units;
    //get the new puids that need to be added
    let newPuids = this.getNewPuids(previousPuids, puids);
    if (newPuids.length === 0) {
      //get the puids that need to be removed
      let oldPuids = this.getNewPuids(puids, previousPuids);
      this.removePuidsFromArray(statuses, 2, oldPuids);
    } else {
      //add all the new protected area intersections into the planning units as status 2
      this.appPuidsToPlanningUnits(statuses, 2, newPuids);
    }
    //update the state
    setDialogsState(prevState => ({ ...prevState, planning_units: statuses });
    //re-render the layer
    renderPuEditLayer();
    //update the pu.dat file
    this.updatePuDatFile();
  }

  getNewPuids(previousPuids, puids) {
    return puids.filter((i) => {
      return previousPuids.indexOf(i) === -1;
    });
  }

  preprocessProtectedAreas(iucnCategory) {
    //have the intersections already been calculated
    if (dialogsState.protected_area_intersections.length > 0) {
      return Promise.resolve(dialogsState.protected_area_intersections);
    } else {
      //do the intersection on the server
      return new Promise((resolve, reject) => {
        //start the logging
        this.startLogging();
        //call the websocket
        this._ws(
          "preprocessProtectedAreas?user=" +
            dialogsState.owner +
            "&project=" +
            dialogsState.project +
            "&planning_grid_name=" +
            dialogsState.metadata.PLANNING_UNIT_NAME,
          this.wsMessageCallback
        )
          .then((message) => {
            //set the state
            setDialogsState(prevState => ({ ...prevState,
              protected_area_intersections: message.intersections,
            });
            //return a value to the then() call
            resolve(message);
          })
          .catch((error) => {
            reject(error);
          });
      }); //return
    }
  }

  getIntersections(iucnCategory) {
    //get the individual iucn categories
    let _iucn_categories = this.getIndividualIucnCategories(iucnCategory);
    //get the planning units that intersect the protected areas with the passed iucn category
    return dialogsState.protected_area_intersections.filter((item) => {
      return _iucn_categories.indexOf(item[0]) > -1;
    });
  }

  //downloads and updates the WDPA on the server
  updateWDPA() {
    //start the logging
    this.startLogging();
    //call the webservice
    return new Promise((resolve, reject) => {
      this._ws(
        "updateWDPA?downloadUrl=" +
          dialogsState.registry.WDPA.downloadUrl +
          "&wdpaVersion=" +
          dialogsState.registry.WDPA.latest_version,
        this.wsMessageCallback
      )
        .then((message) => {
          //websocket has finished - set the new version of the wdpa
          let obj = Object.assign(dialogsState.marxanServer, {
            wdpa_version: dialogsState.registry.WDPA.latest_version,
          });
          //update the state and when it is finished, re-add the wdpa source and layer
          setDialogsState(prevState => ({ ...prevState, newWDPAVersion: false, marxanServer: obj }, () => {
            //set the source for the WDPA layer to the new vector tiles
            this.setWDPAVectorTilesLayerName(
              dialogsState.registry.WDPA.latest_version
            );
            //remove the existing WDPA layer and source
            this.removeMapLayer(CONSTANTS.WDPA_LAYER_NAME);
            if (
              this.map &&
              this.map.getSource(CONSTANTS.WDPA_SOURCE_NAME) !== undefined
            )
              this.map.removeSource(CONSTANTS.WDPA_SOURCE_NAME);
            //re-add the WDPA source and layer
            this.addWDPASource();
            this.addWDPALayer();
            //reset the protected area intersections on the client
            setDialogsState(prevState => ({ ...prevState, protected_area_intersections: [] });
            //recalculate the protected area intersections and refilter the vector tiles
            this.changeIucnCategory(dialogsState.metadata.IUCN_CATEGORY);
            //close the dialog
            updateState({ updateWDPADialogOpen: false });
          });
          resolve(message);
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// BOUNDARY LENGTH AND CLUMPING
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

  async preprocessBoundaryLengths(iucnCategory) {
    if (dialogsState.files.BOUNDNAME) {
      //if the bounds.dat file already exists
      return Promise.resolve();
    } else {
      //calculate the boundary lengths on the server
      return new Promise((resolve, reject) => {
        //start the logging
        this.startLogging();
        //call the websocket
        this._ws(
          "preprocessPlanningUnits?user=" +
            dialogsState.owner +
            "&project=" +
            dialogsState.project,
          this.wsMessageCallback
        )
          .then((message) => {
            //update the state
            var currentFiles = dialogsState.files;
            currentFiles.BOUNDNAME = "bounds.dat";
            setDialogsState(prevState => ({ ...prevState, files: currentFiles });
            //return a value to the then() call
            resolve(message);
          })
          .catch((error) => {
            reject(error);
          });
      }); //return
    }
  }

  showClumpingDialog() {
    //update the map centre and zoom state which is used by the maps in the clumping dialog
    this.updateMapCentreAndZoom();
    //when the boundary lengths have been calculated
    this.preprocessBoundaryLengths()
      .then((intersections) => {
        //update the spec.dat file with any that have been added or removed or changed target or spf
        this.updateSpecFile()
          .then((value) => {
            //when the species file has been updated, update the planning unit file
            this.updatePuFile();
            //when the planning unit file has been updated, update the PuVSpr file - this does all the preprocessing using web sockets
            this.updatePuvsprFile().then((value) => {
              //show the clumping dialog
              setDialogsState(prevState => ({ ...prevState,
                clumpingDialogOpen: true,
                clumpingRunning: true,
              });
            });
          })
          .catch((error) => {
            //updateSpecFile error
          });
      })
      .catch((error) => {
        //preprocessBoundaryLengths error
        console.log(error);
      });
  }

  hideClumpingDialog() {
    //delete the project group
    this.deleteProjects();
    //reset the paint properties in the clumping dialog
    this.resetPaintProperties();
    //return state to normal
    setDialogsState(prevState => ({ ...prevState, clumpingDialogOpen: false });
  }

  //creates a group of 5 projects with UUIDs in the _clumping folder
  createProjectGroupAndRun(blmValues) {
    //clear any exists projects
    if (this.projects) this.deleteProjects();
    return new Promise((resolve, reject) => {
      this._get(
        "createProjectGroup?user=" +
          dialogsState.owner +
          "&project=" +
          dialogsState.project +
          "&copies=5&blmValues=" +
          blmValues.join(",")
      )
        .then((response) => {
          //set the local variable for the projects
          this.projects = response.data;
          //run the projects
          this.runProjects(response.data);
          resolve("Project group created");
        })
        .catch((error) => {
          //do something
          reject(error);
        });
    });
  }

  //deletes the projects from the _clumping folder
  deleteProjects() {
    if (this.projects) {
      var projectNames = this.projects.map((item) => {
        return item.projectName;
      });
      //clear the local variable
      this.projects = undefined;
      return new Promise((resolve, reject) => {
        this._get("deleteProjects?projectNames=" + projectNames.join(","))
          .then((response) => {
            resolve("Projects deleted");
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
  }

const runProjects = async (projects) => {
    //reset the counter
    this.projectsRun = 0;
    //set the intitial state
    setDialogsState(prevState => ({ ...prevState, clumpingRunning: true });
    //run the projects
    projects.forEach((project) => {
      this.startMarxanJob("_clumping", project.projectName, false).then(
        (response) => {
          if (!this.checkForErrors(response, false)) {
            //run completed - get a single solution
            await loadOtherSolution(response.user, response.project, 1);
          }
          //increment the project counter
          this.projectsRun = this.projectsRun + 1;
          //set the state
          if (this.projectsRun === 5) setDialogsState(prevState => ({ ...prevState, clumpingRunning: false });
        }
      );
    });
  }

const rerunProjects = async (blmChanged, blmValues)=> {
  //reset the paint properties in the clumping dialog
  resetPaintProperties();
  //if the blmValues have changed then recreate the project group and run
  if (blmChanged) {
    await createProjectGroupAndRun(blmValues);
  } else {
    //rerun the projects
    await runProjects(this.projects);
  }
}

const setBlmValue = (blmValue)=> {
  const newRunParams = dialogsSate.runParams.map((item) => ({
    key: item.key,
    value: item.key === "BLM" ? String(blmValue) : item.value,
  }));
  
  // Update the run parameters
  this.updateRunParams(newRunParams);
}

const resetPaintProperties = () => {
  //reset the paint properties
  setDialogsState(prevState => ({ ...prevState,
    map0_paintProperty: [],
    map1_paintProperty: [],
    map2_paintProperty: [],
    map3_paintProperty: [],
    map4_paintProperty: [],
  }));
}

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
  startPollingRunLogs() {
    this.runlogTimer = setInterval(() => {
      this.getRunLogs();
    }, 5000);
  }

  //called when the run log dialog closes and stops polling the run log
  stopPollingRunLogs() {
    clearInterval(this.runlogTimer);
  }
  //returns the log of all of the runs from the server
  getRunLogs() {
    if (!dialogsState.unauthorisedMethods.includes("getRunLogs")) {
      this._get("getRunLogs").then((response) => {
        setDialogsState(prevState => ({ ...prevState, runLogs: response.data });
      });
    }
  }

  //clears the records from the run logs file
  clearRunLogs() {
    this._get("clearRunLogs").then((response) => {
      this.getRunLogs();
    });
  }

  getShareableLink() {
    updateState({ shareableLinkDialogOpen: true });
  }

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// GAP ANALYSIS
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

  runGapAnalysis() {
    return new Promise((resolve, reject) => {
      //switches the results pane to the log tab
      this.setActiveTab("log");
      //call the websocket
      this._ws(
        "runGapAnalysis?user=" +
          dialogsState.owner +
          "&project=" +
          dialogsState.project,
        this.wsMessageCallback
      )
        .then((message) => {
          setDialogsState(prevState => ({ ...prevState, gapAnalysis: message.data });
          resolve(message);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //deletes a stored gap analysis on the server
  deleteGapAnalysis() {
    this._get(
      "deleteGapAnalysis?user=" +
        dialogsState.owner +
        "&project=" +
        dialogsState.project
    ).then((response) => {
      console.log(response);
    });
  }

  setAddToProject(evt, isChecked) {
    setDialogsState(prevState => ({ ...prevState, addToProject: isChecked });
  }

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
  changeCostname(costname) {
    console.log("costname ", costname);
    return new Promise((resolve, reject) => {
      this._get(
        "updateCosts?user=" +
          dialogsState.owner +
          "&project=" +
          dialogsState.project +
          "&costname=" +
          costname
      )
        .then((response) => {
          //update the state
          setDialogsState(prevState => ({ ...prevState,
            metadata: Object.assign(dialogsState.metadata, { COSTS: costname }),
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //loads the costs layer
const loadCostsLayer = async (forceReload = false) => {
  setDialogsState(prevState => ({ ...prevState, costsLoading: true });
  this.getPlanningUnitsCostData(forceReload).then((cost_data) => {
    renderPuCostLayer(cost_data).then(() => {
      setDialogsState(prevState => ({ ...prevState, costsLoading: false });
      //do something
    });
  });
}

  //gets the cost data either from cache (if it has already been loaded) or from the server
  getPlanningUnitsCostData(forceReload) {
    let owner = dialogsState.owner === "" ? dialogsState.user : dialogsState.owner;
    console.log("dialogsState.user ", dialogsState.user);
    console.log("dialogsState.owner ", dialogsState.owner);
    return new Promise((resolve, reject) => {
      //if the cost data has already been loaded
      if (this.cost_data && !forceReload) {
        resolve(this.cost_data);
      } else {
        console.log(
          "getPlanningUnitsCostData --------------------------------------------------- line 5569"
        );
        console.log("dialogsState ", dialogsState);
        this._get(
          "getPlanningUnitsCostData?user=" +
            owner +
            "&project=" +
            dialogsState.project
        )
          .then((response) => {
            //save the cost data to a local variable
            this.cost_data = response;
            resolve(response);
          })
          .catch((error) => {
            //do something
          });
      }
    });
  }

  //after clicking cancel in the ImportCostsDialog
  deleteCostFileThenClose(costname) {
    return new Promise((resolve, reject) => {
      if (costname) {
        //delete the cost file
        this.deleteCost(costname).then((_) => {
          //close the import costs dialog
          updateState({ importCostsDialogOpen: false });
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  //adds a cost in application state
const addCost = (costname) => {
  setDialogsState(prevState => ({
    ...prevState,
    costnames: [...prevState.costnames, costname]
  }));
};

  //deletes a cost file on the server
  deleteCost(costname) {
    return new Promise((resolve, reject) => {
      this._get(
        "deleteCost?user=" +
          dialogsState.owner +
          "&project=" +
          dialogsState.project +
          "&costname=" +
          costname
      )
        .then((response) => {
          //update the state
          let _costnames = dialogsState.costnames;
          //remove the deleted cost profile
          _costnames = _costnames.filter((item) => item !== costname);
          setDialogsState(prevState => ({ ...prevState, costnames: _costnames });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  //restores the database back to its original state and runs a git reset on the file system
  resetServer() {
    return new Promise((resolve, reject) => {
      //switches the results pane to the log tab
      this.setActiveTab("log");
      //call the websocket
      this._ws("resetDatabase", this.wsMessageCallback)
        .then((message) => {
          //websocket has finished
          resolve(message);
          updateState({ resetDialogOpen: false });
        })
        .catch((error) => {
          reject(error);
          updateState({ resetDialogOpen: false });
        });
    });
  }

  //cleans up the server - removes dissolved WDPA feature classes, deletes orphaned feature classes, scratch feature classes and clumping files
  cleanup() {
    return new Promise((resolve, reject) => {
      this._get("cleanup?")
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  render() {
    const message = (
      <span
        id="snackbar-message-id"
        dangerouslySetInnerHTML={{ __html: dialogsState.snackbarMessage }}
      />
    );
    return (
      // <ThemeProvider>
      <React.Fragment>
        <div
          ref={(el) => (this.mapContainer = el)}
          className="absolute top right left bottom"
        />
        <LoadingDialog open={dialogsState.shareableLink} />
        <LoginDialog
          open={!dialogsState.loggedIn}
          validateUser={validateUser}
          // onCancel={() => updateState({ registerDialogOpen: true })}
          loading={dialogsState.loading}
          user={dialogsState.user}
          password={dialogsState.password}
          changeUserName={changeUserName}
          changePassword={changePassword}
          updateState={updateState}
          marxanServers={dialogsState.marxanServers}
          selectServer={selectServer}
          marxanServer={dialogsState.marxanServer}
          marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
        />
        <RegisterDialog
          open={dialogsState.registerDialogOpen}
          onOk={handleCreateUser}
          updateState={updateState}
          loading={dialogsState.loading}
        />
        <ResendPasswordDialog
          open={dialogsState.resendPasswordDialogOpen}
          onOk={resendPassword}
          onCancel={() => updateState({ resendPasswordDialogOpen: false })}
          loading={dialogsState.loading}
          changeEmail={changeEmail}
          email={dialogsState.resendEmail}
        />
        <Welcome
          open={
            dialogsState.userData.SHOWWELCOMESCREEN &&
            dialogsState.welcomeDialogOpen
          }
          onOk={updateState}
          onCancel={() => updateState({ welcomeDialogOpen: false })}
          userData={dialogsState.userData}
          saveOptions={saveOptions}
          notifications={dialogsState.notifications}
          resetNotifications={resetNotifications}
          removeNotification={removeNotification}
          openNewProjectDialog={openNewProjectWizardDialog}
        />
        <ToolsMenu
          open={dialogsState.toolsMenuOpen}
          menuAnchor={dialogsState.menuAnchor}
          hideToolsMenu={hideToolsMenu}
          openUsersDialog={openUsersDialog}
          openRunLogDialog={openRunLogDialog}
          openGapAnalysisDialog={openGapAnalysisDialog}
          updateState={updateState}
          userRole={dialogsState.userData.ROLE}
          marxanServer={dialogsState.marxanServer}
          metadata={dialogsState.metadata}
          cleanup={cleanup}
        />
        <UserMenu
          open={dialogsState.userMenuOpen}
          menuAnchor={dialogsState.menuAnchor}
          user={dialogsState.user}
          userRole={dialogsState.userData.ROLE}
          hideUserMenu={hideUserMenu}
          openUserSettingsDialog={openUserSettingsDialog}
          openProfileDialog={openProfileDialog}
          logout={logout}
          marxanServer={dialogsState.marxanServer}
          openChangePasswordDialog={openChangePasswordDialog}
        />
        <HelpMenu
          open={dialogsState.helpMenuOpen}
          menuAnchor={dialogsState.menuAnchor}
          hideHelpMenu={hideHelpMenu}
          openAboutDialog={openAboutDialog}
        />
        <UserSettingsDialog
          open={dialogsState.UserSettingsDialogOpen}
          onOk={() => updateState({ UserSettingsDialogOpen: false })}
          onCancel={() => updateState({ UserSettingsDialogOpen: false })}
          loading={dialogsState.loading}
          userData={dialogsState.userData}
          saveOptions={saveOptions}
          changeBasemap={setBasemap}
          basemaps={dialogsState.basemaps}
          basemap={dialogsState.basemap}
        />
        <UsersDialog
          open={dialogsState.usersDialogOpen}
          onOk={() => updateState({ usersDialogOpen: false })}
          onCancel={() => updateState({ usersDialogOpen: false })}
          loading={dialogsState.loading}
          user={dialogsState.user}
          users={dialogsState.users}
          deleteUser={handleDeleteUser}
          changeRole={changeRole}
          guestUserEnabled={dialogsState.marxanServer.guestUserEnabled}
          toggleEnableGuestUser={toggleEnableGuestUser}
        />
        <ProfileDialog
          open={dialogsState.profileDialogOpen}
          onOk={() => updateState({ profileDialogOpen: false })}
          onCancel={() => updateState({ profileDialogOpen: false })}
          loading={dialogsState.loading}
          userData={dialogsState.userData}
          updateUser={handleUserUpdate}
        />
        <AboutDialog
          open={dialogsState.aboutDialogOpen}
          onOk={() => updateState({ aboutDialogOpen: false })}
          marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
          wdpaAttribution={dialogsState.wdpaAttribution}
        />
        <InfoPanel
          open={dialogsState.infoPanelOpen}
          activeTab={dialogsState.activeTab}
          user={dialogsState.user}
          owner={dialogsState.owner}
          project={dialogsState.project}
          metadata={dialogsState.metadata}
          runMarxan={runMarxan}
          stopProcess={stopProcess}
          pid={dialogsState.pid}
          renameProject={renameProject}
          renameDescription={renameDescription}
          features={dialogsState.projectFeatures}
          project_tab_active={project_tab_active}
          features_tab_active={features_tab_active}
          pu_tab_active={pu_tab_active}
          startPuEditSession={startPuEditSession}
          stopPuEditSession={stopPuEditSession}
          puEditing={dialogsState.puEditing}
          clearManualEdits={clearManualEdits}
          openFeatureMenu={openFeatureMenu}
          preprocessing={dialogsState.preprocessing}
          openFeaturesDialog={openFeaturesDialog}
          changeIucnCategory={changeIucnCategory}
          updateFeature={updateFeature}
          userRole={dialogsState.userData.ROLE}
          toggleProjectPrivacy={toggleProjectPrivacy}
          openTargetDialog={openTargetDialog}
          getShareableLink={getShareableLink}
          marxanServer={dialogsState.marxanServer}
          toggleFeatureLayer={toggleFeatureLayer}
          toggleFeaturePUIDLayer={toggleFeaturePUIDLayer}
          useFeatureColors={dialogsState.userData.USEFEATURECOLORS}
          smallLinearGauge={dialogsState.smallLinearGauge}
          openCostsDialog={openCostsDialog}
          costname={dialogsState.metadata.COSTS}
          costnames={dialogsState.costnames}
          changeCostname={changeCostname}
          loadCostsLayer={loadCostsLayer}
          loading={dialogsState.loading}
          updateState={updateState}
          protected_area_intersections={dialogsState.protected_area_intersections}
        />
        <ResultsPanel
          open={dialogsState.resultsPanelOpen}
          preprocessing={dialogsState.preprocessing}
          solutions={dialogsState.solutions}
          loadSolution={loadSolution}
          openClassificationDialog={openClassificationDialog}
          brew={dialogsState.brew}
          messages={dialogsState.logMessages}
          activeResultsTab={dialogsState.activeResultsTab}
          setActiveTab={setActiveTab}
          clearLog={clearLog}
          owner={dialogsState.owner}
          resultsLayer={dialogsState.resultsLayer}
          wdpaLayer={dialogsState.wdpaLayer}
          pa_layer_visible={dialogsState.pa_layer_visible}
          changeOpacity={changeOpacity}
          userRole={dialogsState.userData.ROLE}
          visibleLayers={dialogsState.visibleLayers}
          metadata={dialogsState.metadata}
          costsLoading={dialogsState.costsLoading}
        />
        <FeatureInfoDialog
          open={dialogsState.openInfoDialogOpen}
          onOk={() => updateState({ openInfoDialogOpen: false })}
          onCancel={() => updateState({ openInfoDialogOpen: false })}
          loading={dialogsState.loading}
          feature={dialogsState.currentFeature}
          updateFeature={updateFeature}
          userRole={dialogsState.userData.ROLE}
          reportUnits={dialogsState.userData.REPORTUNITS}
        />
        <IdentifyPopup
          visible={dialogsState.identifyVisible}
          xy={dialogsState.popup_point}
          identifyPlanningUnits={dialogsState.identifyPlanningUnits}
          identifyProtectedAreas={dialogsState.identifyProtectedAreas}
          identifyFeatures={dialogsState.identifyFeatures}
          loading={dialogsState.loading}
          hideIdentifyPopup={hideIdentifyPopup}
          reportUnits={dialogsState.userData.REPORTUNITS}
          metadata={dialogsState.metadata}
        />
        <ProjectsDialog
          open={dialogsState.projectsDialogOpen}
          onCancel={() =>
            updateState({
              projectsDialogOpen: false,
              importProjectPopoverOpen: false,
            })
          }
          loading={dialogsState.loading}
          projects={dialogsState.projects}
          oldVersion={dialogsState.metadata.OLDVERSION}
          updateState={updateState}
          deleteProject={deleteProject}
          loadProject={loadProject}
          exportProject={exportProject}
          cloneProject={cloneProject}
          unauthorisedMethods={dialogsState.unauthorisedMethods}
          userRole={dialogsState.userData.ROLE}
          getAllFeatures={getAllFeatures}
          importProjectPopoverOpen={dialogsState.importProjectPopoverOpen}
          importMXWDialogOpen={dialogsState.importMXWDialogOpen}
        />
        <NewProjectDialog
          open={dialogsState.newProjectDialogOpen}
          registry={dialogsState.registry}
          loading={dialogsState.loading}
          getPlanningUnitGrids={getPlanningUnitGrids}
          planning_unit_grids={dialogsState.planning_unit_grids}
          openFeaturesDialog={openFeaturesDialog}
          features={dialogsState.allFeatures}
          updateState={updateState}
          selectedCosts={dialogsState.selectedCosts}
          createNewProject={createNewProject}
          previewFeature={previewFeature}
        />
        <NewProjectWizardDialog
          open={dialogsState.newProjectWizardDialogOpen}
          onOk={() => updateState({ newProjectWizardDialogOpen: false })}
          okDisabled={true}
          countries={dialogsState.countries}
          updateState={updateState}
          createNewNationalProject={createNewNationalProject}
        />
        <NewPlanningGridDialog
          open={dialogsState.NewPlanningGridDialogOpen}
          onCancel={() =>
            updateState({ NewPlanningGridDialogOpen: false })
          }
          loading={
            dialogsState.loading ||
            dialogsState.preprocessing ||
            dialogsState.uploading
          }
          createNewPlanningUnitGrid={createNewPlanningUnitGrid}
          countries={dialogsState.countries}
          setSnackBar={setSnackBar}
        />
        <NewMarinePlanningGridDialog
          open={dialogsState.NewMarinePlanningGridDialogOpen}
          onCancel={() =>
            updateState({ NewMarinePlanningGridDialogOpen: false })
          }
          loading={
            dialogsState.loading ||
            dialogsState.preprocessing ||
            dialogsState.uploading
          }
          createNewPlanningUnitGrid={createNewMarinePlanningUnitGrid}
          fileUpload={uploadFileToFolder}
          setSnackBar={setSnackBar}
        />
        <ImportPlanningGridDialog
          open={dialogsState.importPlanningGridDialogOpen}
          onOk={importPlanningUnitGrid}
          onCancel={() =>
            updateState({ importPlanningGridDialogOpen: false })
          }
          loading={dialogsState.loading || dialogsState.uploading}
          fileUpload={uploadFileToFolder}
        />
        <FeaturesDialog
          open={dialogsState.featuresDialogOpen}
          onOk={updateSelectedFeatures}
          loading={dialogsState.loading || dialogsState.uploading}
          metadata={dialogsState.metadata}
          allFeatures={dialogsState.allFeatures}
          deleteFeature={deleteFeature}
          updateState={updateState}
          selectAllFeatures={selectAllFeatures}
          userRole={dialogsState.userData.ROLE}
          clickFeature={clickFeature}
          addingRemovingFeatures={dialogsState.addingRemovingFeatures}
          selectedFeatureIds={dialogsState.selectedFeatureIds}
          initialiseDigitising={initialiseDigitising}
          newFeaturePopoverOpen={dialogsState.newFeaturePopoverOpen}
          importFeaturePopoverOpen={dialogsState.importFeaturePopoverOpen}
          previewFeature={previewFeature}
          marxanServer={dialogsState.marxanServer}
          refreshFeatures={refreshFeatures}
        />
        <FeatureDialog
          open={dialogsState.featureDialogOpen}
          onOk={() => updateState({ featureDialogOpen: false })}
          loading={dialogsState.loading}
          feature_metadata={dialogsState.feature_metadata}
          getTilesetMetadata={getMetadata}
          setSnackBar={setSnackBar}
          reportUnits={dialogsState.userData.REPORTUNITS}
          getProjectList={getProjectList}
        />
        <NewFeatureDialog
          open={dialogsState.NewFeatureDialogOpen}
          onOk={closeNewFeatureDialog}
          onCancel={closeNewFeatureDialog}
          loading={dialogsState.loading || dialogsState.uploading}
          createNewFeature={createNewFeature}
          addToProject={dialogsState.addToProject}
          setAddToProject={setAddToProject}
        />
        <ImportFeaturesDialog
          open={dialogsState.importFeaturesDialogOpen}
          importFeatures={importFeatures}
          loading={
            dialogsState.loading ||
            dialogsState.preprocessing ||
            dialogsState.uploading
          }
          updateState={updateState}
          filename={dialogsState.featureDatasetFilename}
          fileUpload={uploadFileToFolder}
          unzipShapefile={unzipShapefile}
          getShapefileFieldnames={getShapefileFieldnames}
          deleteShapefile={deleteShapefile}
          addToProject={dialogsState.addToProject}
          setAddToProject={setAddToProject}
        />
        <ImportFromWebDialog
          open={dialogsState.importFromWebDialogOpen}
          onCancel={updateState}
          loading={
            dialogsState.loading ||
            dialogsState.preprocessing ||
            dialogsState.uploading
          }
          importFeatures={importFeaturesFromWeb}
          addToProject={dialogsState.addToProject}
          setAddToProject={setAddToProject}
        />
        <ImportGBIFDialog
          open={dialogsState.importGBIFDialogOpen}
          updateState={updateState}
          loading={
            dialogsState.loading ||
            dialogsState.preprocessing ||
            dialogsState.uploading
          }
          importGBIFData={importGBIFData}
          gbifSpeciesSuggest={gbifSpeciesSuggest}
          addToProject={dialogsState.addToProject}
          setAddToProject={setAddToProject}
        />
        <PlanningGridsDialog
          open={dialogsState.planningGridsDialogOpen}
          updateState={updateState}
          loading={dialogsState.loading}
          getPlanningUnitGrids={getPlanningUnitGrids}
          unauthorisedMethods={dialogsState.unauthorisedMethods}
          planningGrids={dialogsState.planning_unit_grids}
          openNewPlanningGridDialog={openNewPlanningGridDialog}
          exportPlanningGrid={exportPlanningGrid}
          deletePlanningGrid={deletePlanningUnitGrid}
          previewPlanningGrid={previewPlanningGrid}
          marxanServer={dialogsState.marxanServer}
          fullWidth={true}
          maxWidth="false"
        />
        <PlanningGridDialog
          open={dialogsState.planningGridDialogOpen}
          onOk={() => updateState({ planningGridDialogOpen: false })}
          updateState={updateState}
          loading={dialogsState.loading}
          planning_grid_metadata={dialogsState.planning_grid_metadata}
          getTilesetMetadata={getMetadata}
          setSnackBar={setSnackBar}
          getProjectList={getProjectList}
        />
        <ProjectsListDialog
          open={dialogsState.ProjectsListDialogOpen}
          projects={dialogsState.projectList}
          userRole={dialogsState.userData.ROLE}
          onOk={() => updateState({ ProjectsListDialogOpen: false })}
          title={dialogsState.projectListDialogTitle}
          heading={dialogsState.projectListDialogHeading}
        />
        <CostsDialog
          open={dialogsState.costsDialogOpen}
          onOk={() => updateState({ costsDialogOpen: false })}
          onCancel={() => updateState({ costsDialogOpen: false })}
          updateState={updateState}
          unauthorisedMethods={dialogsState.unauthorisedMethods}
          costname={dialogsState.metadata.COSTS}
          deleteCost={deleteCost}
          data={dialogsState.costnames}
          allImpacts={dialogsState.allImpacts}
          planningUnitName={dialogsState.metadata.PLANNING_UNIT_NAME}
          createCostsFromImpact={createCostsFromImpact}
        />
        <ImportCostsDialog
          open={dialogsState.importCostsDialogOpen}
          addCost={addCost}
          updateState={updateState}
          deleteCostFileThenClose={deleteCostFileThenClose}
          loading={dialogsState.loading}
          fileUpload={uploadFileToProject}
        />
        <RunSettingsDialog
          open={dialogsState.settingsDialogOpen}
          onOk={() => updateState({ settingsDialogOpen: false })}
          onCancel={() => updateState({ settingsDialogOpen: false })}
          loading={dialogsState.loading || dialogsState.preprocessing}
          updateRunParams={updateRunParams}
          runParams={dialogsState.runParams}
          showClumpingDialog={showClumpingDialog}
          userRole={dialogsState.userData.ROLE}
        />
        <ClassificationDialog
          open={dialogsState.classificationDialogOpen}
          onOk={closeClassificationDialog}
          onCancel={closeClassificationDialog}
          loading={dialogsState.loading}
          renderer={dialogsState.renderer}
          changeColorCode={changeColorCode}
          changeRenderer={changeRenderer}
          changeNumClasses={changeNumClasses}
          changeShowTopClasses={changeShowTopClasses}
          summaryStats={dialogsState.summaryStats}
          brew={dialogsState.brew}
          dataBreaks={dialogsState.dataBreaks}
        />
        <ClumpingDialog
          open={dialogsState.clumpingDialogOpen}
          onOk={hideClumpingDialog}
          onCancel={hideClumpingDialog}
          tileset={dialogsState.tileset}
          map0_paintProperty={dialogsState.map0_paintProperty}
          map1_paintProperty={dialogsState.map1_paintProperty}
          map2_paintProperty={dialogsState.map2_paintProperty}
          map3_paintProperty={dialogsState.map3_paintProperty}
          map4_paintProperty={dialogsState.map4_paintProperty}
          mapCentre={dialogsState.mapCentre}
          mapZoom={dialogsState.mapZoom}
          createProjectGroupAndRun={createProjectGroupAndRun}
          rerunProjects={rerunProjects}
          setBlmValue={setBlmValue}
          clumpingRunning={dialogsState.clumpingRunning}
        />
        <ImportProjectDialog
          open={dialogsState.importProjectDialogOpen}
          onOk={() => updateState({ importProjectDialogOpen: false })}
          loading={dialogsState.loading || dialogsState.uploading}
          importProject={importProject}
          fileUpload={uploadFileToFolder}
          log={log}
          setSnackBar={setSnackBar}
        />
        <ImportMXWDialog
          open={dialogsState.importMXWDialogOpen}
          onOk={() => updateState({ importMXWDialogOpen: false })}
          loading={dialogsState.loading || dialogsState.preprocessing}
          importMXWProject={importMXWProject}
          fileUpload={uploadFileToFolder}
          log={log}
          setSnackBar={setSnackBar}
        />
        <ResetDialog
          open={dialogsState.resetDialogOpen}
          onOk={resetServer}
          onCancel={() => updateState({ resetDialogOpen: false })}
          onClose={() => updateState({ resetDialogOpen: false })}
          loading={dialogsState.loading}
        />
        <RunLogDialog
          open={dialogsState.runLogDialogOpen}
          onOk={closeRunLogDialog}
          onClose={closeRunLogDialog}
          loading={dialogsState.loading}
          preprocessing={dialogsState.preprocessing}
          unauthorisedMethods={dialogsState.unauthorisedMethods}
          runLogs={dialogsState.runLogs}
          getRunLogs={getRunLogs}
          clearRunLogs={clearRunLogs}
          stopMarxan={stopProcess}
          userRole={dialogsState.userData.ROLE}
        />
        <ServerDetailsDialog
          open={dialogsState.serverDetailsDialogOpen}
          onOk={closeServerDetailsDialog}
          onCancel={closeServerDetailsDialog}
          onClose={closeServerDetailsDialog}
          updateState={updateState}
          marxanServer={dialogsState.marxanServer}
          newWDPAVersion={dialogsState.newWDPAVersion}
          registry={dialogsState.registry}
        />
        <UpdateWDPADialog
          open={dialogsState.updateWDPADialogOpen}
          onOk={() => updateState({ updateWDPADialogOpen: false })}
          onCancel={() => updateState({ updateWDPADialogOpen: false })}
          newWDPAVersion={dialogsState.newWDPAVersion}
          updateWDPA={updateWDPA}
          loading={dialogsState.preprocessing}
          registry={dialogsState.registry}
        />
        <ChangePasswordDialog
          open={dialogsState.changePasswordDialogOpen}
          onOk={closeChangePasswordDialog}
          user={dialogsState.user}
          onClose={closeChangePasswordDialog}
          checkPassword={checkPassword}
          setSnackBar={setSnackBar}
          updateUser={handleUserUpdate}
        />
        <AlertDialog
          open={dialogsState.alertDialogOpen}
          onOk={() => updateState({ alertDialogOpen: false })}
        />
        <Snackbar
          open={dialogsState.snackbarOpen}
          message={message}
          onClose={closeSnackbar}
          style={{ maxWidth: "800px !important" }}
          bodyStyle={{ maxWidth: "800px !important" }}
        />
        <Popover
          open={dialogsState.featureMenuOpen}
          anchorEl={dialogsState.menuAnchor}
          onClose={closeFeatureMenu}
          style={{ width: "307px" }}
        >
          <Menu
            style={{ width: "207px" }}
            onMouseLeave={closeFeatureMenu}
          >
            <MenuItemWithButton
              leftIcon={<Properties style={{ margin: "1px" }} />}
              onClick={() =>
                updateState({
                  openInfoDialogOpen: true,
                  featureMenuOpen: false,
                })
              }
            >
              Properties
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={<RemoveFromProject style={{ margin: "1px" }} />}
              style={{
                display:
                  dialogsState.currentFeature.old_version ||
                  dialogsState.userData.ROLE === "ReadOnly"
                    ? "none"
                    : "block",
              }}
              onClick={removeFromProject.bind(
                this,
                dialogsState.currentFeature
              )}
            >
              Remove from project
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={
                dialogsState.currentFeature.feature_layer_loaded ? (
                  <RemoveFromMap style={{ margin: "1px" }} />
                ) : (
                  <AddToMap style={{ margin: "1px" }} />
                )
              }
              style={{
                display: dialogsState.currentFeature.tilesetid ? "block" : "none",
              }}
              onClick={toggleFeatureLayer.bind(
                this,
                dialogsState.currentFeature
              )}
            >
              {dialogsState.currentFeature.feature_layer_loaded
                ? "Remove from map"
                : "Add to map"}
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={
                dialogsState.currentFeature.feature_puid_layer_loaded ? (
                  <RemoveFromMap style={{ margin: "1px" }} />
                ) : (
                  <AddToMap style={{ margin: "1px" }} />
                )
              }
              onClick={toggleFeaturePUIDLayer.bind(
                this,
                dialogsState.currentFeature
              )}
              disabled={
                !(
                  dialogsState.currentFeature.preprocessed &&
                  dialogsState.currentFeature.occurs_in_planning_grid
                )
              }
            >
              {dialogsState.currentFeature.feature_puid_layer_loaded
                ? "Remove planning unit outlines"
                : "Outline planning units where the feature occurs"}
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={<ZoomIn style={{ margin: "1px" }} />}
              style={{
                display: dialogsState.currentFeature.extent ? "block" : "none",
              }}
              onClick={zoomToFeature.bind(this, dialogsState.currentFeature)}
            >
              Zoom to feature extent
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={<Preprocess style={{ margin: "1px" }} />}
              style={{
                display:
                  dialogsState.currentFeature.old_version ||
                  dialogsState.userData.ROLE === "ReadOnly"
                    ? "none"
                    : "block",
              }}
              onClick={preprocessSingleFeature.bind(
                this,
                dialogsState.currentFeature
              )}
              disabled={
                dialogsState.currentFeature.preprocessed ||
                dialogsState.preprocessing
              }
            >
              Pre-process
            </MenuItemWithButton>
          </Menu>
        </Popover>
        <TargetDialog
          open={dialogsState.targetDialogOpen}
          onOk={closeTargetDialog}
          showCancelButton={true}
          onCancel={closeTargetDialog}
          updateTargetValueForFeatures={updateTargetValueForFeatures.bind(
            this
          )}
        />
        <GapAnalysisDialog
          open={dialogsState.gapAnalysisDialogOpen}
          showCancelButton={true}
          onOk={closeGapAnalysisDialog}
          onCancel={closeGapAnalysisDialog}
          closeGapAnalysisDialog={closeGapAnalysisDialog}
          gapAnalysis={dialogsState.gapAnalysis}
          preprocessing={dialogsState.preprocessing}
          projectFeatures={dialogsState.projectFeatures}
          metadata={dialogsState.metadata}
          marxanServer={dialogsState.marxanServer}
          reportUnits={dialogsState.userData.REPORTUNITS}
        />
        <ShareableLinkDialog
          open={dialogsState.shareableLinkDialogOpen}
          onOk={() => updateState({ shareableLinkDialogOpen: false })}
          shareableLinkUrl={
            window.location +
            "?server=" +
            dialogsState.marxanServer.name +
            "&user=" +
            dialogsState.user +
            "&project=" +
            dialogsState.project
          }
        />
        <AtlasLayersDialog
          open={dialogsState.atlasLayersDialogOpen}
          onOk={closeAtlasLayersDialog}
          onCancel={clearSelactedLayers}
          loading={dialogsState.loading}
          atlasLayers={dialogsState.atlasLayers}
          marxanServer={dialogsState.marxanServer}
          setSnackBar={setSnackBar}
          selectedLayers={dialogsState.selectedLayers}
          setselectedLayers={setselectedLayers}
        />
        <CumulativeImpactDialog
          loading={dialogsState.loading || dialogsState.uploading}
          open={dialogsState.cumulativeImpactDialogOpen}
          onOk={() => updateState({ cumulativeImpactDialogOpen: false })}
          onCancel={() =>
            updateState({ cumulativeImpactDialogOpen: false })
          }
          openHumanActivitiesDialog={openHumanActivitiesDialog}
          metadata={dialogsState.metadata}
          allImpacts={dialogsState.allImpacts}
          clickImpact={clickImpact}
          initialiseDigitising={initialiseDigitising}
          updateState={updateState}
          selectedImpactIds={dialogsState.selectedImpactIds}
          openImportedActivitesDialog={openImportedActivitesDialog}
          setSnackBar={setSnackBar}
          userRole={dialogsState.userData.ROLE}
        />
        <HumanActivitiesDialog
          loading={dialogsState.loading || dialogsState.uploading}
          open={dialogsState.humanActivitiesDialogOpen}
          onOk={() => updateState({ humanActivitiesDialogOpen: false })}
          onCancel={() =>
            updateState({ humanActivitiesDialogOpen: false })
          }
          updateState={updateState}
          metadata={dialogsState.metadata}
          activities={dialogsState.activities}
          initialiseDigitising={initialiseDigitising}
          setSnackBar={setSnackBar}
          userRole={dialogsState.userData.ROLE}
          fileUpload={uploadRaster}
          saveActivityToDb={saveActivityToDb}
          openImportedActivitesDialog={openImportedActivitesDialog}
        />
        <RunCumuluativeImpactDialog
          loading={dialogsState.loading || dialogsState.uploading}
          open={dialogsState.importedActivitiesDialogOpen}
          onOk={() => updateState({ importedActivitiesDialogOpen: false })}
          onCancel={() =>
            updateState({ importedActivitiesDialogOpen: false })
          }
          updateState={updateState}
          metadata={dialogsState.metadata}
          uploadedActivities={dialogsState.uploadedActivities}
          setSnackBar={setSnackBar}
          userRole={dialogsState.userData.ROLE}
          runCumulativeImpact={runCumulativeImpact}
        />
        <MenuBar
          open={dialogsState.loggedIn}
          user={dialogsState.user}
          userRole={dialogsState.userData.ROLE}
          infoPanelOpen={dialogsState.infoPanelOpen}
          resultsPanelOpen={dialogsState.resultsPanelOpen}
          toggleInfoPanel={toggleInfoPanel}
          toggleResultsPanel={toggleResultsPanel}
          showToolsMenu={showToolsMenu}
          showUserMenu={showUserMenu}
          showHelpMenu={showHelpMenu}
          marxanServer={dialogsState.marxanServer.name}
          openProjectsDialog={openProjectsDialog}
          openServerDetailsDialog={openServerDetailsDialog}
          openActivitiesDialog={openActivitiesDialog}
          openFeaturesDialog={openFeaturesDialog}
          openPlanningGridsDialog={openPlanningGridsDialog}
          openCumulativeImpactDialog={openCumulativeImpactDialog}
          openAtlasLayersDialog={openAtlasLayersDialog}
        />
      </React.Fragment>
      // </ThemeProvider>
    );
  }
}

export default App;

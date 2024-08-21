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
import { createNewUser, updateUser, deleteUser, getUsers} from "./User/userService";
import { getProjectList, getProjectsForFeature } from "./Projects/projectsService";

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
        await selectServer(serverData);
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
  const wsMessageCallback = (message) =>  {
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
        newFeatureCreated(message.id);
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
    // Implement server selection logic
    console.log('server ', server);
    setMarxanServer(server);
    // Check if there is a new version of the WDPA
    if (server.wdpa_version !== registry.WDPA.latest_version) ? setNewWDPAVersion(true): setNewWDPAVersion(false);
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
  const getPuidsFromNormalisedData = (normalisedData) => {
 return normalisedData.flatMap(item => item[1]);
};

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
    const response = await _get(`getUser?user=${this.state.user}`);
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

const changeRole = (user, role) => {
  handleUserUpdate({ ROLE: role }, user);
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
  const saveOptions = (options) => await handleUserUpdate(options);
  
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
  const formData = new FormData();
  formData.append("user", dialogsState.user);
  formData.append("project", project.name);
  formData.append("description", project.description);
  formData.append("planning_grid_name", project.planning_grid_name);
  const interest_features = [];
  const target_values = [];
  const spf_values = [];
  project.features.forEach((item) => {
    interest_features.push(item.id);
    target_values.push(17);
    spf_values.push(40);
  });
  //prepare the data that will populate the spec.dat file
  formData.append("interest_features", interest_features.join(","));
  formData.append("target_values", target_values.join(","));
  formData.append("spf_values", spf_values.join(","));
  
  const response = await _post("createProject", formData);
  
  setSnackBar(response.info);
  setDialogsState(prevState => ({ ...prevState, projectsDialogOpen: false }));
  
  await loadProject(response.name, response.user);
}

const createNewNationalProject = (params) => {
  try {
    const response = await createNewPlanningUnitGrid(params.iso3, params.domain, params.areakm2, params.shape);
    console.log(response)
  } catch (error) {
    console.log(error);
  }
}

//REST call to create a new import project from the wizard
const createImportProject = async (project) => {
  const formData = new FormData();
  formData.append("user", dialogsState.user);
  formData.append("project", project);
  return await _post("createImportProject", formData);
}

//REST call to delete a specific project
const deleteProject = async (user, project, silent = false) => {
  const response = await _get(`deleteProject?user=${user}&project=${project}`);
  await getProjects();
  // Dont always want tp show snackbar -  e.g. on a rollback after an unsuccesful import
  setSnackBar(response.info, silent); 
  //see if the user deleted the current project
  if (response.project === this.state.project) {
    setSnackBar("Current project deleted - loading first available");
    //load the next available project
    dialogsState.projects.some((project) => {
      if (project.name !== this.state.project) {
        await loadProject(project.name, this.state.user);
      }
      return project.name !== dialogsState.project;
    });
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
const runMarxan = (event) => {
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
const updateSpecFile = () => {
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
  this.setFeaturesState(updatedFeatures);
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

  importProject(project, description, zipFilename, files, planning_grid_name) {
    return new Promise((resolve, reject) => {
      let feature_class_name = "",
        uploadId;
      //start the logging
      this.startLogging();
      //set the spinner and lot states
     messageLogger({
        method: "importProject",
        status: "Importing",
        info: "Starting import..",
      });
      //create a new project
      //TODO: SORT OUT ROLLING BACK IF AN IMPORT FAILS - AND DONT PROVIDE REST CALLS TO DELETE PLANNING UNITS
      this.createImportProject(project)
        .then((response) => {
         messageLogger({
            method: "importProject",
            status: "Importing",
            info: "Project '" + project + "' created",
          });
          //create the planning unit file
          this.importZippedShapefileAsPu(
            zipFilename,
            planning_grid_name,
            "Imported with the project '" + project + "'"
          )
            .then((response) => {
              //get the planning unit feature_class_name
              feature_class_name = response.feature_class_name;
              //get the uploadid
              uploadId = response.uploadId;
             messageLogger({
                method: "importProject",
                status: "Importing",
                info: "Planning grid imported",
              });
              //upload all of the files from the local system
              this.uploadFiles(files, project)
                .then((response) => {
                 messageLogger({
                    method: "importProject",
                    status: "Importing",
                    info: "All files uploaded",
                  });
                  //upgrade the project to the new version of Marxan - this adds the necessary settings in the project file and calculates the statistics for species in the puvspr.dat and puts them in the feature_preprocessing.dat file
                  this.upgradeProject(project)
                    .then((response) => {
                     messageLogger({
                        method: "importProject",
                        status: "Importing",
                        info: "Project updated to new version",
                      });
                      //update the project file with the new settings - we also have to set the OUTPUTDIR to the standard 'output' as some imported projects may have set different output folders, e.g. output_BLMBEST
                      let d = new Date();
                      let formattedDate =
                        ("00" + d.getDate()).slice(-2) +
                        "/" +
                        ("00" + (d.getMonth() + 1)).slice(-2) +
                        "/" +
                        d.getFullYear().toString().slice(-2) +
                        " " +
                        ("00" + d.getHours()).slice(-2) +
                        ":" +
                        ("00" + d.getMinutes()).slice(-2) +
                        ":" +
                        ("00" + d.getSeconds()).slice(-2);
                      this.updateProjectParams(project, {
                        DESCRIPTION:
                          description +
                          " (imported from an existing Marxan project)",
                        CREATEDATE: formattedDate,
                        OLDVERSION: "True",
                        PLANNING_UNIT_NAME: feature_class_name,
                        OUTPUTDIR: "output",
                      })
                        .then((response) => {
                          // wait for the tileset to upload to mapbox
                          this.pollMapbox(uploadId).then((response) => {
                            //refresh the planning grids
                            this.getPlanningUnitGrids();
                           messageLogger({
                              method: "importProject",
                              status: "Finished",
                              info: "Import complete",
                            });
                            //now open the project
                            this.loadProject(project, this.state.user);
                            resolve("Import complete");
                          });
                        })
                        .catch((error) => {
                          //updateProjectParams error
                          reject(error);
                        });
                    })
                    .catch((error) => {
                      //upgradeProject error
                      reject(error);
                    });
                })
                .catch((error) => {
                  //uploadFiles error
                  reject(error);
                });
            })
            .catch((error) => {
              //importZippedShapefileAsPu error - delete the project
              this.deleteProject(this.state.user, project, true);
              reject(error);
            });
        })
        .catch((error) => {
          //createImportProject failed - the project already exists
          reject(error);
        });
    });
  }

  //uploads a list of files to the current project
  async uploadFiles(files, project) {
    var file, filepath;
    for (var i = 0; i < files.length; i++) {
      file = files.item(i);
      //see if it is a marxan data file
      if (file.name.slice(-4) === ".dat") {
        const formData = new FormData();
        formData.append("user", this.state.owner);
        formData.append("project", project);
        //the webkitRelativePath will include the folder itself so we have to remove this, e.g. 'Marxan project/input/puvspr.dat' -> '/input/puvspr.dat'
        filepath = file.webkitRelativePath.split("/").slice(1).join("/");
        formData.append("filename", filepath);
        formData.append("value", file);
       messageLogger({
          method: "uploadFiles",
          status: "Uploading",
          info: "Uploading: " + file.webkitRelativePath,
        });
        await this._post("uploadFile", formData);
      }
    }
  }

  //uploads a single file to the current projects input folder
  uploadFileToProject(value, filename, project) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("user", this.state.owner);
      formData.append("project", this.state.project);
      formData.append("filename", "input/" + filename);
      formData.append("value", value);
      this._post("uploadFile", formData).then(function (response) {
        resolve(response);
      });
    });
  }

  //uploads a single file to a specific folder - value is the filename
  uploadFileToFolder(value, filename, destFolder) {
    return new Promise((resolve, reject) => {
      setDialogsState(prevState => ({ ...prevState, loading: true });
      const formData = new FormData();
      //the binary data for the file
      formData.append("value", value);
      //the filename
      formData.append("filename", filename);
      //the folder to upload to
      formData.append("destFolder", destFolder);
      this._post("uploadFileToFolder", formData).then(function (response) {
        resolve(response);
      });
    });
  }

  //pads a number with zeros to a specific size, e.g. pad(9,5) => 00009
  pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  //imports a project from an mxd file
  importMXWProject(project, description, filename) {
    return new Promise((resolve, reject) => {
      this.startLogging();
      this._ws(
        "importProject?user=" +
          this.state.user +
          "&project=" +
          project +
          "&filename=" +
          filename +
          "&description=" +
          description,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //websocket has finished
          resolve(message);
          //refresh the project features as there may be new ones
          this.refreshFeatures();
          //load the project
          this.loadProject(project, this.state.user);
        })
        .catch((error) => {
          //do something
          reject(error);
        });
    });
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
  loadSolution(solution) {
    if (solution === "Sum") {
      this.updateProtectedAmount(this.runMarxanResponse.mvbest);
      //load the sum of solutions which will already be loaded
      this.renderSolution(this.runMarxanResponse.ssoln, true);
    } else {
      this.getSolution(this.state.owner, this.state.project, solution).then(
        (response) => {
          this.updateProtectedAmount(response.mv);
          this.renderSolution(response.solution, false);
        }
      );
    }
  }

  //load a solution from another project - used in the clumping dialog - when the solution is loaded the paint properties are set on the individual maps through state changes
  loadOtherSolution(user, project, solution) {
    this.getSolution(user, project, solution).then((response) => {
      var paintProperties = this.getPaintProperties(
        response.solution,
        false,
        false
      );
      //get the project that matches the project name from the this.projects property - this was set when the projectGroup was created
      if (this.projects) {
        var _projects = this.projects.filter((item) => {
          return item.projectName === project;
        });
        //get which clump it is
        var clump = _projects[0].clump;
        switch (clump) {
          case 0:
            setDialogsState(prevState => ({ ...prevState, map0_paintProperty: paintProperties });
            break;
          case 1:
            setDialogsState(prevState => ({ ...prevState, map1_paintProperty: paintProperties });
            break;
          case 2:
            setDialogsState(prevState => ({ ...prevState, map2_paintProperty: paintProperties });
            break;
          case 3:
            setDialogsState(prevState => ({ ...prevState, map3_paintProperty: paintProperties });
            break;
          case 4:
            setDialogsState(prevState => ({ ...prevState, map4_paintProperty: paintProperties });
            break;
          default:
            break;
        }
      }
    });
  }

  //gets a solution and returns a promise
  getSolution(user, project, solution) {
    return this._get(
      "getSolution?user=" +
        user +
        "&project=" +
        project +
        "&solution=" +
        solution
    );
  }

  //gets the total number of planning units in the ssoln and outputs the statistics of the distribution to state, e.g. 2 PUs with a value of 1, 3 with a value of 2 etc.
  getssolncount(data) {
    let total = 0;
    let summaryStats = [];
    data.map((item) => {
      summaryStats.push({ number: item[0], count: item[1].length });
      total += item[1].length;
      return null;
    });
    setDialogsState(prevState => ({ ...prevState, summaryStats: summaryStats });
    return total;
  }
  //gets a sample of the data to be able to do a classification, e.g. natural breaks, jenks etc.
  getssolnSample(data, sampleSize) {
    let sample = [],
      num = 0;
    let ssolnLength = this.getssolncount(data);
    data.map((item) => {
      //use the ceiling function to force outliers to be in the classification, i.e. those planning units that were only selected in 1 solution
      num = Math.ceil((item[1].length / ssolnLength) * sampleSize);
      sample.push(Array(num).fill(item[0]));
      return null;
    });
    return [].concat.apply([], sample);
  }

  //get all data from the ssoln arrays
  getSsolnData(data) {
    let arrays = data.map((item) => {
      return item[1];
    });
    return [].concat.apply([], arrays);
  }

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// CLASSIFICATION AND RENDERING
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

  //gets the classification and colorbrewer object for doing the rendering
  classifyData(data, numClasses, colorCode, classification) {
    //get a sample of the data to make the renderer classification
    let sample = this.getssolnSample(data, 1000); //samples dont work
    // let sample = this.getSsolnData(data); //get all the ssoln data
    //set the data
    this.state.brew.setSeries(sample);
    //if the colorCode is opacity then calculate the rgba values dynamically and add them to the color schemes
    if (colorCode === "opacity") {
      //see if we have already created a brew color scheme for opacity with NUMCLASSES
      if (
        this.state.brew.colorSchemes.opacity === undefined ||
        (this.state.brew.colorSchemes.opacity &&
          !this.state.brew.colorSchemes.opacity[this.state.renderer.NUMCLASSES])
      ) {
        //get a copy of the brew state
        let brewCopy = this.state.brew;
        let newBrewColorScheme = Array(Number(this.state.renderer.NUMCLASSES))
          .fill("rgba(255,0,136,")
          .map((item, index) => {
            return item + (1 / this) * (index + 1) + ")";
          }, this.state.renderer.NUMCLASSES);
        //add the new color scheme
        if (brewCopy.colorSchemes.opacity === undefined)
          brewCopy.colorSchemes.opacity = [];
        brewCopy.colorSchemes.opacity[this.state.renderer.NUMCLASSES] =
          newBrewColorScheme;
        //set the state
        setDialogsState(prevState => ({ ...prevState, brew: brewCopy });
      }
    }
    //set the color code - see the color theory section on Joshua Tanners page here https://github.com/tannerjt/classybrew - for all the available colour codes
    this.state.brew.setColorCode(colorCode);
    //get the maximum number of colors in this scheme
    let colorSchemeLength = getMaxNumberOfClasses(this.state.brew, colorCode);
    //check the color scheme supports the passed number of classes
    if (numClasses > colorSchemeLength) {
      //set the numClasses to the max for the color scheme
      numClasses = colorSchemeLength;
      //reset the renderer
      setDialogsState(prevState => ({ ...prevState,
        renderer: Object.assign(this.state.renderer, {
          NUMCLASSES: numClasses,
        }),
      });
    }
    //set the number of classes
    this.state.brew.setNumClasses(numClasses);
    //set the classification method - one of equal_interval, quantile, std_deviation, jenks (default)
    this.state.brew.classify(classification);
    setDialogsState(prevState => ({ ...prevState, dataBreaks: this.state.brew.getBreaks() });
  }

  //called when the renderer state has been updated - renders the solution and saves the renderer back to the server
  rendererStateUpdated(parameter, value) {
    this.renderSolution(this.runMarxanResponse.ssoln, true);
    if (this.state.userData.ROLE !== "ReadOnly")
      this.updateProjectParameter(parameter, value);
  }
  //change the renderer, e.g. jenks, natural_breaks etc.
  changeRenderer(renderer) {
    setDialogsState(
      {
        renderer: Object.assign(this.state.renderer, {
          CLASSIFICATION: renderer,
        }),
      },
      () => {
        this.rendererStateUpdated("CLASSIFICATION", renderer);
      }
    );
  }
  //change the number of classes of the renderer
  changeNumClasses(numClasses) {
    setDialogsState(
      {
        renderer: Object.assign(this.state.renderer, {
          NUMCLASSES: numClasses,
        }),
      },
      () => {
        this.rendererStateUpdated("NUMCLASSES", numClasses);
      }
    );
  }
  //change the color code of the renderer
  changeColorCode(colorCode) {
    //set the maximum number of classes that can be selected in the other select boxes
    if (this.state.renderer.NUMCLASSES > this.state.brew.getNumClasses()) {
      setDialogsState(prevState => ({ ...prevState,
        renderer: Object.assign(this.state.renderer, {
          NUMCLASSES: this.state.brew.getNumClasses(),
        }),
      });
    }
    setDialogsState(
      {
        renderer: Object.assign(this.state.renderer, { COLORCODE: colorCode }),
      },
      () => {
        this.rendererStateUpdated("COLORCODE", colorCode);
      }
    );
  }
  //change how many of the top classes only to show
  changeShowTopClasses(numClasses) {
    setDialogsState(
      {
        renderer: Object.assign(this.state.renderer, {
          TOPCLASSES: numClasses,
        }),
      },
      () => {
        this.rendererStateUpdated("TOPCLASSES", numClasses);
      }
    );
  }
  //renders the solution - data is the REST response and sum is a flag to indicate if the data is the summed solution (true) or an individual solution (false)
  renderSolution(data, sum) {
    if (!data) return;
    var paintProperties = this.getPaintProperties(data, sum, true);
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

  //gets the various paint properties for the planning unit layer - if setRenderer is true then it will also update the renderer in the Legend panel
  getPaintProperties(data, sum, setRenderer) {
    //build an expression to get the matching puids with different numbers of 'numbers' in the marxan results
    var fill_color_expression = this.initialiseFillColorExpression("puid");
    var fill_outline_color_expression =
      this.initialiseFillColorExpression("puid");
    if (data.length > 0) {
      var color, visibleValue, value;
      //create the renderer using Joshua Tanners excellent library classybrew - available here https://github.com/tannerjt/classybrew
      if (setRenderer)
        this.classifyData(
          data,
          Number(this.state.renderer.NUMCLASSES),
          this.state.renderer.COLORCODE,
          this.state.renderer.CLASSIFICATION
        );
      //if only the top n classes will be rendered then get the visible value at the boundary
      if (this.state.renderer.TOPCLASSES < this.state.renderer.NUMCLASSES) {
        let breaks = this.state.brew.getBreaks();
        visibleValue =
          breaks[
            this.state.renderer.NUMCLASSES - this.state.renderer.TOPCLASSES + 1
          ];
      } else {
        visibleValue = 0;
      }
      // the rest service sends the data grouped by the 'number', e.g. [1,[23,34,36,43,98]],[2,[16,19]]
      data.forEach((row, index) => {
        if (sum) {
          //multi value rendering
          value = row[0];
          //for each row add the puids and the color to the expression, e.g. [35,36,37],"rgba(255, 0, 136,0.1)"
          color = this.state.brew.getColorInRange(value);
          //add the color to the expression - transparent if the value is less than the visible value
          if (value >= visibleValue) {
            fill_color_expression.push(row[1], color);
            fill_outline_color_expression.push(
              row[1],
              "rgba(150, 150, 150, 0.6)"
            ); //gray outline
          } else {
            fill_color_expression.push(row[1], "rgba(0, 0, 0, 0)");
            fill_outline_color_expression.push(row[1], "rgba(0, 0, 0, 0)");
          }
        } else {
          //single value rendering
          fill_color_expression.push(row[1], "rgba(255, 0, 136,1)");
          fill_outline_color_expression.push(
            row[1],
            "rgba(150, 150, 150, 0.6)"
          ); //gray outline
        }
      });
      // Last value is the default, used where there is no data
      fill_color_expression.push("rgba(0,0,0,0)");
      fill_outline_color_expression.push("rgba(0,0,0,0)");
    } else {
      fill_color_expression = "rgba(0, 0, 0, 0)";
      fill_outline_color_expression = "rgba(0, 0, 0, 0)";
    }
    return {
      fillColor: fill_color_expression,
      oulineColor: fill_outline_color_expression,
    };
  }

  //initialises the fill color expression for matching on attributes values
  initialiseFillColorExpression(attribute) {
    return ["match", ["get", attribute]];
  }

  //renders the planning units edit layer according to the type of layer and pu status
  renderPuEditLayer() {
    let expression;
    if (this.state.planning_units.length > 0) {
      //build an expression to get the matching puids with different statuses in the planning units data
      expression = ["match", ["get", "puid"]];
      // the rest service sends the data grouped by the status, e.g. [1,[23,34,36,43,98]],[2,[16,19]]
      this.state.planning_units.forEach((row, index) => {
        var color;
        //get the status
        switch (row[0]) {
          // case 1: //The PU will be included in the initial reserve system but may or may not be in the final solution.
          //   color = "rgba(63, 191, 63, 1)";
          //   break;
          case 2: //The PU is fixed in the reserve system (“locked in”). It starts in the initial reserve system and cannot be removed.
            color = "rgba(63, 63, 191, 1)";
            break;
          case 3: //The PU is fixed outside the reserve system (“locked out”). It is not included in the initial reserve system and cannot be added.
            color = "rgba(191, 63, 63, 1)";
            break;
          default:
            break;
        }
        //add the color to the expression
        expression.push(row[1], color);
      });
      // Last value is the default, used where there is no data - i.e. for all the planning units with a status of 0
      expression.push("rgba(150, 150, 150, 0)");
    } else {
      //there are no statuses apart from the default 0 status so have a single renderer
      expression = "rgba(150, 150, 150, 0)";
    }
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
  renderPuCostLayer(cost_data) {
    return new Promise((resolve, reject) => {
      let expression;
      if (cost_data.data.length > 0) {
        //build an expression to get the matching puids with different costs
        expression = ["match", ["get", "puid"]];
        //iterate through the cost data and set the expressions
        cost_data.data.forEach((row, index) => {
          //get the branch labels, i.e. the puids for this histogram bin - they could be empty
          if (row[1].length > 0)
            expression.push(row[1], CONSTANTS.COST_COLORS[index]);
        });
        // Last value is the default
        expression.push("rgba(150, 150, 150, 0)");
      } else {
        //there are no costs apart from the default 0 status so have a single renderer
        expression = "rgba(150, 150, 150, 0.7)";
      }
      //set the render paint property
      this.map.setPaintProperty(
        CONSTANTS.COSTS_LAYER_NAME,
        "fill-color",
        expression
      );
      //set the min/max properties in the layer as metadata
      this.setLayerMetadata(CONSTANTS.COSTS_LAYER_NAME, {
        min: cost_data.min,
        max: cost_data.max,
      });
      //show the layer
      this.showLayer(CONSTANTS.COSTS_LAYER_NAME);
      resolve("Costs rendered");
    });
  }

  //convenience method to get the rendered features safely and not to show and error message if the layer doesnt exist in the map style
  getRenderedFeatures(pt, layers) {
    let features = [];
    if (this.map.getLayer(layers[0]))
      features = this.map.queryRenderedFeatures(pt, { layers: layers });
    return features;
  }
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
  createMap(url) {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: url,
      center: [0, 0],
      zoom: 2,
    });
    //add event handlers for the load and error events
    this.map.on("load", this.mapLoaded.bind(this));
    this.map.on("error", this.mapError.bind(this));
    //click event
    this.map.on("click", this.mapClick.bind(this));
    //style change, this includes adding/removing layers and showing/hiding layers
    this.map.on("styledata", this.mapStyleChanged.bind(this));
  }

  mapLoaded(e) {
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
      if (this.state.clumpingDialogOpen) this.updateMapCentreAndZoom(); //only update the state if the clumping dialog is open
    });
    this.map.on("draw.create", this.polygonDrawn.bind(this));
  }

  updateMapCentreAndZoom() {
    setDialogsState(prevState => ({ ...prevState,
      mapCentre: this.map.getCenter(),
      mapZoom: this.map.getZoom(),
    });
  }

  //catch all event handler for map errors
  mapError(e) {
    var message = "";
    switch (e.error.message) {
      case "Not Found":
        message = "The tileset '" + e.source.url + "' was not found";
        break;
      case "Bad Request":
        message =
          "The tileset from source '" +
          e.sourceId +
          "' was not found. See <a href='" +
          CONSTANTS.ERRORS_PAGE +
          "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>";
        break;
      default:
        message = e.error.message;
        break;
    }
    if (message !== "http status 200 returned without content.") {
      this.setSnackBar("MapError: " + message);
      console.error(message);
    }
  }

  //
  mapClick(e) {
    //if the user is not editing planning units or creating a new feature then show the identify features for the clicked point
    if (!this.state.puEditing && !this.map.getSource("mapbox-gl-draw-cold")) {
      //get a list of the layers that we want to query for features
      var featureLayers = this.getLayers([
        CONSTANTS.LAYER_TYPE_PLANNING_UNITS,
        CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS,
        CONSTANTS.LAYER_TYPE_PROTECTED_AREAS,
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
      ]);
      //get the feature layer ids
      let featureLayerIds = featureLayers.map((item) => item.id);
      //get a list of all of the rendered features that were clicked on - these will be planning units, features and protected areas
      var clickedFeatures = this.getRenderedFeatures(e.point, featureLayerIds);
      //set the popup point
      setDialogsState(prevState => ({ ...prevState, popup_point: e.point });
      //get any planning unit features under the mouse
      let planningUnitFeatures = this.getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_pu_"
      );
      if (
        planningUnitFeatures.length &&
        planningUnitFeatures[0].properties.puid
      )
        this.getPUData(planningUnitFeatures[0].properties.puid);
      //get any conservation features under the mouse
      let identifyFeatures = this.getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_feature_layer_"
      );
      //there may be dupliate conservation features (e.g. with GBIF data) so get a unique list of sourceLayers
      let sourceLayers = identifyFeatures.map((item) => item.sourceLayer);
      let uniqueSourceLayers = Array.from(new Set(sourceLayers));
      //get the full features data from the state.projectFeatures array
      identifyFeatures = uniqueSourceLayers.map((item) => {
        let matchingItem = this.state.projectFeatures.filter((item2) => {
          return item2.feature_class_name === item; //the features feature_class_name is the name of the sourcelayer in the vector tile
        })[0];
        return matchingItem;
      });
      //get any protected area features under the mouse
      let identifyProtectedAreas = this.getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_wdpa_"
      );
      //set the state to populate the identify popup
      setDialogsState(prevState => ({ ...prevState,
        identifyVisible: true,
        identifyFeatures: identifyFeatures,
        identifyProtectedAreas: identifyProtectedAreas,
      });
    }
  }

  //called when layers are added/removed or shown/hidden
  mapStyleChanged(e) {
    //update legend items
    this.updateLegend();
  }
  //after a layer has been added/removed/shown/hidden update the legend items
  updateLegend() {
    let layers = this.map.getStyle().layers;
    //get the visible marxan layers
    let visibleLayers = layers.filter((item) => {
      if (item.id.substr(0, 7) === "marxan_") {
        return item.layout.visibility === "visible";
      } else {
        return false;
      }
    });
    //set the state
    setDialogsState(prevState => ({ ...prevState, visibleLayers: visibleLayers });
  }
  //gets a set of features that have a layerid that starts with the passed text
  getFeaturesByLayerStartsWith(features, startsWith) {
    let matchedFeatures = features.filter((item) => {
      return item.layer.id.substr(0, startsWith.length) === startsWith;
    });
    return matchedFeatures;
  }

  //gets a list of features for the planning unit
  getPUData(puid) {
    this._get(
      "getPUData?user=" +
        this.state.owner +
        "&project=" +
        this.state.project +
        "&puid=" +
        puid
    ).then((response) => {
      if (response.data.features.length) {
        //if there are some features for the planning unit join the ids onto the full feature data from the state.projectFeatures array
        this.joinArrays(
          response.data.features,
          this.state.projectFeatures,
          "species",
          "id"
        );
      }
      //set the state to update the identify popup
      setDialogsState(prevState => ({ ...prevState,
        identifyPlanningUnits: {
          puData: response.data.pu_data,
          features: response.data.features,
        },
      });
    });
  }

  //joins a set of data from one object array to another
  joinArrays(arr1, arr2, leftId, rightId) {
    let outputArr = [];
    arr1.forEach((item) => {
      //get the matching item in the second array
      let matchingItem = arr2.filter(
        (arr2item) => arr2item[rightId] === item[leftId]
      );
      if (matchingItem.length)
        outputArr.push(Object.assign(item, matchingItem[0]));
    });
    return outputArr;
  }

  //hides the identify popup
  hideIdentifyPopup(e) {
    setDialogsState(prevState => ({ ...prevState, identifyVisible: false, identifyPlanningUnits: {} });
  }

  //gets a Mapbox Style Specification JSON object from the passed ESRI style endpoint
  getESRIStyle(styleUrl) {
    return new Promise((resolve, reject) => {
      fetch(styleUrl) //fetch the style json
        .then((response) => {
          return response.json().then((style) => {
            // next fetch metadata for the raw tiles
            const TileJSON = style.sources.esri.url;
            fetch(TileJSON).then((response) => {
              return response.json().then((metadata) => {
                let tilesurl =
                  metadata.tiles[0].substr(0, 1) === "/"
                    ? TileJSON + metadata.tiles[0]
                    : TileJSON + "/" + metadata.tiles[0];
                style.sources.esri = {
                  type: "vector",
                  scheme: "xyz",
                  tilejson: metadata.tilejson || "2.0.0",
                  format:
                    (metadata.tileInfo && metadata.tileInfo.format) || "pbf",
                  /* mapbox-gl-js does not respect the indexing of esri tiles because we cache to different zoom levels depending on feature density, in rural areas 404s will still be encountered. more info: https://github.com/mapbox/mapbox-gl-js/pull/1377*/
                  // index: metadata.tileMap ? style.sources.esri.url + '/' + metadata.tileMap : null,
                  maxzoom: 15,
                  tiles: [tilesurl],
                  description: metadata.description,
                  name: metadata.name,
                };
                resolve(style);
              });
            });
          });
        });
    });
  }

  //sets the basemap either on project load, or if the user changes it
  setBasemap(basemap) {
    console.log("setBasemap ", basemap);
    return new Promise((resolve, reject) => {
      //change the state
      setDialogsState(prevState => ({ ...prevState, basemap: basemap.name });
      //get a valid map style
      this.getValidStyle(basemap).then((style) => {
        //load the style
        this.loadMapStyle(style).then((evt) => {
          //add the WDPA layer
          this.addWDPASource();
          this.addWDPALayer();
          //add the planning unit layers (if a project has already been loaded)
          if (this.state.tileset) {
            this.addPlanningGridLayers(this.state.tileset);
            //get the results, if any
            if (this.state.owner)
              this.getResults(this.state.owner, this.state.project);
            //filter the wdpa vector tiles - NO LONGER USED
            // this.filterWdpaByIucnCategory(this.state.metadata.IUCN_CATEGORY);
            //turn on/off layers depending on which tab is selected
            if (this.state.activeTab === "planning_units") this.pu_tab_active();
            resolve();
          } else {
            resolve();
          }
        });
      });
    });
  }

  //gets the style JSON either as a valid TileJSON object or as a url to a valid TileJSON object
  getValidStyle(basemap) {
    return new Promise((resolve, reject) => {
      switch (basemap.provider) {
        case "esri":
          //the style json will be loaded dynamically from an esri endpoint and parsed to produce a valid TileJSON object
          this.getESRIStyle(basemap.id).then((styleJson) => {
            resolve(styleJson);
          });
          break;
        case "local":
          //blank background
          resolve({
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
          });
          break;
        default:
          // the style is a url - just return the url - either mapbox or jrc provided
          resolve(CONSTANTS.MAPBOX_STYLE_PREFIX + basemap.id);
          break;
      }
    });
  }

  //loads the maps style using either a url to a Mapbox Style Specification file or a JSON object
  loadMapStyle(style) {
    return new Promise((resolve, reject) => {
      if (!this.map) {
        this.createMap(style);
      } else {
        //request the style
        this.map.setStyle(style, { diff: false });
      }
      this.map.on("style.load", (evt) => {
        resolve("Map style loaded");
      });
    });
  }

  //called when the planning grid layer has changed, i.e. the project has changed
  changePlanningGrid(tilesetid) {
    return new Promise((resolve, reject) => {
      //get the tileset metadata
      this.getMetadata(tilesetid)
        .then((tileset) => {
          //remove the results layer, planning unit layer etc.
          this.removePlanningGridLayers();
          //add the results layer, planning unit layer etc.
          this.addPlanningGridLayers(tileset);
          //zoom to the layers extent
          if (tileset.bounds != null) zoomToBounds(this.map, tileset.bounds);
          //set the state
          setDialogsState(prevState => ({ ...prevState, tileset: tileset });
          //filter the wdpa vector tiles as the map doesn't respond to state changes - NO LONGER USED
          // this.filterWdpaByIucnCategory(this.state.metadata.IUCN_CATEGORY);
          resolve();
        })
        .catch((error) => {
          this.setSnackBar(error);
          reject(error);
        });
    });
  }

  //gets all of the metadata for the tileset
  getMetadata(tilesetId) {
    console.log("getMetadata ");
    return new Promise((resolve, reject) => {
      fetch(
        "https://api.mapbox.com/v4/" +
          tilesetId +
          ".json?secure&access_token=pk.eyJ1IjoiY3JhaWNlcmphY2siLCJhIjoiY2syeXhoMjdjMDQ0NDNnbDk3aGZocWozYiJ9.T-XaC9hz24Gjjzpzu6RCzg" // +
        // this.state.registry.MBAT_PUBLIC
      )
        .then((response) => response.json())
        .then((response2) => {
          if (
            response2.message != null &&
            response2.message.indexOf("does not exist") > 0
          ) {
            reject(
              "The tileset '" +
                tilesetId +
                "' was not found. See <a href='" +
                CONSTANTS.ERRORS_PAGE +
                "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>"
            );
          } else {
            resolve(response2);
          }
        });
    });
  }

  //adds the results, planning unit, planning unit edit etc layers to the map
  addPlanningGridLayers(tileset) {
    //add the source for the planning unit layers
    this.map.addSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME, {
      type: "vector",
      url: "mapbox://" + tileset.id,
    });
    //add the results layer
    this.addMapLayer({
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
    this.addMapLayer({
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
    });
    //add the planning unit layer
    this.addMapLayer({
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
    this.addMapLayer({
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

  removePlanningGridLayers() {
    let layers = this.map.getStyle().layers;
    //get the dynamically added layers
    let dynamicLayers = layers.filter((item) => {
      return item.source === CONSTANTS.PLANNING_UNIT_SOURCE_NAME;
    });
    //remove them from the map
    dynamicLayers.forEach((item) => {
      this.removeMapLayer(item.id);
    });
    //remove the sources if present
    if (this.map.getSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME) !== undefined)
      this.map.removeSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME);
  }

  //adds the WDPA vector tile layer source - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  addWDPASource() {
    //add the source for the wdpa
    let yr = this.state.marxanServer.wdpa_version.substr(-4); //get the year from the wdpa_version
    let attribution =
      "IUCN and UNEP-WCMC (" +
      yr +
      "), The World Database on Protected Areas (WDPA) " +
      this.state.marxanServer.wdpa_version +
      ", Cambridge, UK: UNEP-WCMC. Available at: <a href='http://www.protectedplanet.net'>www.protectedplanet.net</a>";
    let tiles = [
      this.state.registry.WDPA.tilesUrl +
        "layer=marxan:" +
        wdpaVectorTileLayer +
        "&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}",
    ];
    setDialogsState(prevState => ({ ...prevState, wdpaAttribution: attribution });
    this.map.addSource(CONSTANTS.WDPA_SOURCE_NAME, {
      attribution: attribution,
      type: "vector",
      tiles: tiles,
    });
  }

  //adds the WDPA vector tile layer - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  addWDPALayer() {
    this.addMapLayer({
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
        "fill-color": {
          type: "categorical",
          property: "marine",
          stops: [
            ["0", "rgb(99,148,69)"],
            ["1", "rgb(63,127,191)"],
            ["2", "rgb(63,127,191)"],
          ],
        },
        "fill-outline-color": {
          type: "categorical",
          property: "marine",
          stops: [
            ["0", "rgb(99,148,69)"],
            ["1", "rgb(63,127,191)"],
            ["2", "rgb(63,127,191)"],
          ],
        },
        "fill-opacity": CONSTANTS.WDPA_FILL_LAYER_OPACITY,
      },
    });
    //set the wdpa layer in app state so that it can update the Legend component and its opacity control
    setDialogsState(prevState => ({ ...prevState, wdpaLayer: this.map.getLayer(CONSTANTS.WDPA_LAYER_NAME) });
  }

  showLayer(id) {
    if (this.map && this.map.getLayer(id))
      this.map.setLayoutProperty(id, "visibility", "visible");
  }
  hideLayer(id) {
    if (this.map && this.map.getLayer(id))
      this.map.setLayoutProperty(id, "visibility", "none");
  }
  //centralised code to add a layer to the maps current style
  addMapLayer(mapLayer, beforeLayer) {
    //if a beforeLayer is not passed get the first symbol layer (i.e. label layer) and we will add all fill or line layers before this
    if (!beforeLayer) {
      var allLayers = this.map.getStyle().layers;
      //get the symbol layers
      let symbollayers = allLayers.filter((item) => item.type === "symbol");
      //get the first symbol layer if there are some, otherwise an empty string
      beforeLayer = symbollayers.length ? symbollayers[0].id : "";
    }
    //add the layer
    this.map.addLayer(mapLayer, beforeLayer);
  }
  //centralised code to remove a layer from the maps current style
  removeMapLayer(layerid) {
    this.map.removeLayer(layerid);
  }
  isLayerVisible(layername) {
    return (
      this.map &&
      this.map.getLayer(layername) &&
      this.map.getLayoutProperty(layername, "visibility") === "visible"
    );
  }

  //changes the layers opacity
  changeOpacity(layerId, opacity) {
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
  setLayerMetadata(layerId, metadata) {
    let layer = this.map.getLayer(layerId);
    //merge the metadata with the existing metadata
    if (layer) layer.metadata = Object.assign(layer.metadata, metadata);
  }

  //gets a particular set of layers based on the layer types (layerTypes is an array of layer types)
  getLayers(layerTypes) {
    //get the map layers
    var allLayers = this.map.getStyle().layers;
    //iterate through the layers to get the matching ones
    return allLayers.filter((layer) => {
      if (
        layer.hasOwnProperty("metadata") &&
        layer.metadata.hasOwnProperty("type")
      ) {
        return layerTypes.includes(layer.metadata.type);
      } else {
        return false;
      }
    });
  }

  //shows/hides layers of a particular type (layerTypes is an array of layer types)
  showHideLayerTypes(layerTypes, show) {
    //get the marxan layers
    let layers = this.getLayers(layerTypes);
    layers.forEach((layer) => {
      if (show) {
        this.showLayer(layer.id);
      } else {
        this.hideLayer(layer.id);
      }
    });
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
  features_tab_active() {
    if (this.state.activeTab !== "features") {
      setDialogsState(prevState => ({ ...prevState, activeTab: "features" });
      //render the sum solution map
      // this.renderSolution(this.runMarxanResponse.ssoln, true);
      //hide the planning unit layers
      this.pu_tab_inactive();
    }
  }

  //fired when the planning unit tab is selected
  pu_tab_active() {
    setDialogsState(prevState => ({ ...prevState, activeTab: "planning_units" });
    //show the planning units layer
    this.showLayer(CONSTANTS.PU_LAYER_NAME);
    //show the planning units status layer
    this.showLayer(CONSTANTS.STATUS_LAYER_NAME);
    //show the planning units costs layer
    this.loadCostsLayer();
    //hide the results layer
    this.hideLayer(CONSTANTS.RESULTS_LAYER_NAME);
    //hide the feature layer and feature puid layers
    this.showHideLayerTypes(
      [
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ],
      false
    );
    //render the planning units status layer_edit layer
    this.renderPuEditLayer(CONSTANTS.STATUS_LAYER_NAME);
  }

  //fired whenever another tab is selected
  const pu_tab_inactive = () => {
    //show the results layer
    this.showLayer(CONSTANTS.RESULTS_LAYER_NAME);
    //show the feature layer and feature puid layers
    this.showHideLayerTypes(
      [
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ],
      true
    );
    //hide the planning units layer
    this.hideLayer(CONSTANTS.PU_LAYER_NAME);
    //hide the planning units edit layer
    this.hideLayer(CONSTANTS.STATUS_LAYER_NAME);
    //hide the planning units cost layer
    this.hideLayer(CONSTANTS.COSTS_LAYER_NAME);
  }

  // fired when a new tab is selected
  setActiveTab(newValue) {
    setDialogsState(prevState => ({ ...prevState, activeResultsTab: newValue });
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

  startPuEditSession() {
    //set the state
    setDialogsState(prevState => ({ ...prevState, puEditing: true });
    //set the cursor to a crosshair
    this.map.getCanvas().style.cursor = "crosshair";
    //add the left mouse click event to the planning unit layer
    this.onClickRef = this.moveStatusUp.bind(this); //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("click", CONSTANTS.PU_LAYER_NAME, this.onClickRef);
    //add the mouse right click event to the planning unit layer
    this.onContextMenu = this.resetStatus.bind(this); //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("contextmenu", CONSTANTS.PU_LAYER_NAME, this.onContextMenu);
  }

  stopPuEditSession() {
    //set the state
    setDialogsState(prevState => ({ ...prevState, puEditing: false });
    //reset the cursor
    this.map.getCanvas().style.cursor = "pointer";
    //remove the mouse left click event
    this.map.off("click", CONSTANTS.PU_LAYER_NAME, this.onClickRef);
    //remove the mouse right click event
    this.map.off("contextmenu", CONSTANTS.PU_LAYER_NAME, this.onContextMenu);
    //update the pu.dat file
    this.updatePuDatFile();
  }

  //clears all of the manual edits from the pu edit layer (except the protected area units)
  clearManualEdits() {
    //clear all the planning unit statuses
    setDialogsState(prevState => ({ ...prevState, planning_units: [] }, () => {
      //get the puids for the current iucn category
      let puids = this.getPuidsFromIucnCategory(
        this.state.metadata.IUCN_CATEGORY
      );
      //update the planning units
      this.updatePlanningUnits([], puids);
    });
  }

  //sends a list of puids that should be excluded from the run to upddate the pu.dat file
  updatePuDatFile() {
    //initialise the form data
    let formData = new FormData();
    //add the current user
    formData.append("user", this.state.owner);
    //add the current project
    formData.append("project", this.state.project);
    //add the planning unit manual exceptions
    if (this.state.planning_units.length > 0) {
      this.state.planning_units.forEach((item) => {
        //get the name of the status parameter
        let param_name = "status" + item[0];
        //add the planning units
        formData.append(param_name, item[1]);
      });
    }
    //post to the server
    this._post("updatePUFile", formData).then((response) => {
      //do something
    });
  }

  //fired when the user left clicks on a planning unit to move its status up
  moveStatusUp(e) {
    this.changeStatus(e, "up");
  }

  //fired when the user left clicks on a planning unit to reset its status
  resetStatus(e) {
    this.changeStatus(e, "reset");
  }

  changeStatus(e, direction) {
    //get the feature that the user has clicked
    var features = this.getRenderedFeatures(e.point, [CONSTANTS.PU_LAYER_NAME]);
    //get the featureid
    if (features.length > 0) {
      //get the puid
      let puid = features[0].properties.puid;
      //get its current status
      let status = this.getStatusLevel(puid);
      //get the next status level
      let next_status = this.getNextStatusLevel(status, direction);
      //copy the current planning unit statuses
      let statuses = this.state.planning_units;
      //if the planning unit is not at level 0 (in which case it will not be in the planning_units state) - then remove it from the puids array for that status
      if (status !== 0) this.removePuidFromArray(statuses, status, puid);
      //add it to the new status array
      if (next_status !== 0) this.addPuidToArray(statuses, next_status, puid);
      //set the state
      setDialogsState(prevState => ({ ...prevState, planning_units: statuses });
      //re-render the planning unit edit layer
      this.renderPuEditLayer();
    }
  }

  getStatusLevel(puid) {
    //iterate through the planning unit statuses to see which status the clicked planning unit belongs to, i.e. 1, 2 or 3
    let status_level = 0; //default level as the getPlanningUnits REST call only returns the planning units with non-default values
    CONSTANTS.PLANNING_UNIT_STATUSES.forEach((item) => {
      let planning_units = this.getPlanningUnitsByStatus(item);
      if (planning_units.indexOf(puid) > -1) {
        status_level = item;
      }
    });
    return status_level;
  }

  //gets the array index position for the passed status in the planning_units state
  getStatusPosition(status) {
    let position = -1;
    this.state.planning_units.forEach((item, index) => {
      if (item[0] === status) position = index;
    });
    return position;
  }

  //returns the planning units with a particular status, e.g. 1,2,3
  getPlanningUnitsByStatus(status) {
    //get the position of the status items in the this.state.planning_units
    let position = this.getStatusPosition(status);
    //get the array of planning units
    let returnValue =
      position > -1 ? this.state.planning_units[position][1] : [];
    return returnValue;
  }

  //returns the next status level for a planning unit depending on the direction
  getNextStatusLevel(status, direction) {
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

  //removes in individual puid value from an array of puid statuses
  removePuidFromArray(statuses, status, puid) {
    return this.removePuidsFromArray(statuses, status, [puid]);
  }

  addPuidToArray(statuses, status, puid) {
    return this.appPuidsToPlanningUnits(statuses, status, [puid]);
  }

  //adds all the passed puids to the planning_units state
  appPuidsToPlanningUnits(statuses, status, puids) {
    //get the position of the status items in the this.state.planning_units, i.e. the index
    let position = this.getStatusPosition(status);
    if (position === -1) {
      //create a new status and empty puid array
      statuses.push([status, []]);
      position = statuses.length - 1;
    }
    //add the puids to the puid array ensuring that they are unique
    statuses[position][1] = Array.from(
      new Set(statuses[position][1].concat(puids))
    );
    return statuses;
  }

  //removes all the passed puids from the planning_units state
  removePuidsFromArray(statuses, status, puids) {
    //get the position of the status items in the this.state.planning_units
    let position = this.getStatusPosition(status);
    if (position > -1) {
      let puid_array = statuses[position][1];
      let new_array = puid_array.filter((item) => {
        return puids.indexOf(item) < 0;
      });
      statuses[position][1] = new_array;
      //if there are no more items in the puid array then remove it
      if (new_array.length === 0) statuses.splice(position, 1);
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
  previewPlanningGrid(planning_grid_metadata) {
    setDialogsState(prevState => ({ ...prevState,
      planning_grid_metadata: planning_grid_metadata,
      planningGridDialogOpen: true,
    });
  }

  //creates a new planning grid unit
  createNewPlanningUnitGrid(iso3, domain, areakm2, shape) {
    return new Promise((resolve, reject) => {
      this.startLogging();
      this._ws(
        "createPlanningUnitGrid?iso3=" +
          iso3 +
          "&domain=" +
          domain +
          "&areakm2=" +
          areakm2 +
          "&shape=" +
          shape,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          this.newPlanningGridCreated(message).then(() => {
            this.updateState({ NewPlanningGridDialogOpen: false });
            //websocket has finished
            resolve(message);
          });
        })
        .catch((error) => {
          //do something
          reject(error);
        });
    });
  }

  //creates a new planning grid unit
  createNewMarinePlanningUnitGrid(filename, planningGridName, areakm2, shape) {
    return new Promise((resolve, reject) => {
      this.startLogging();
      this._ws(
        "createMarinePlanningUnitGrid?filename=" +
          filename +
          "&planningGridName=" +
          planningGridName +
          "&areakm2=" +
          areakm2 +
          "&shape=" +
          shape,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          this.newMarinePlanningGridCreated(message).then(() => {
            this.updateState({ NewMarinePlanningGridDialogOpen: false });
            //websocket has finished
            resolve(message);
          });
        })
        .catch((error) => {
          //do something
          reject(error);
        });
    });
  }

  //imports a zipped shapefile as a new planning grid
  importPlanningUnitGrid(zipFilename, alias, description) {
    return new Promise((resolve, reject) => {
      this.startLogging();
     messageLogger({
        method: "importPlanningUnitGrid",
        status: "Started",
        info: "Importing planning grid..",
      });
      this.importZippedShapefileAsPu(zipFilename, alias, description)
        .then((response) => {
         messageLogger({
            method: "importPlanningUnitGrid",
            status: "Finished",
            info: response.info,
          });
          this.newPlanningGridCreated(response).then(() => {
            this.updateState({ importPlanningGridDialogOpen: false });
          });
        })
        .catch((error) => {
          //importZippedShapefileAsPu error
          this.deletePlanningUnitGrid(alias, true);
         messageLogger({
            method: "importPlanningUnitGrid",
            status: "Finished",
            error: error,
          });
          reject(error);
        });
    });
  }

  //called when a new planning grid has been created
  newPlanningGridCreated(response) {
    return new Promise((resolve, reject) => {
      //start polling to see when the upload is done
      this.pollMapbox(response.uploadId).then((response) => {
        //update the planning unit items
        this.getPlanningUnitGrids();
        resolve("Planning grid created");
      });
    });
  }

  //deletes a planning unit grid
  deletePlanningUnitGrid(feature_class_name, silent = false) {
    if (silent) {
      //used to roll back failed imports of planning grids
      this.deletePlanningGrid(feature_class_name, true);
    } else {
      //get a list of the projects for the planning grid
      this.getProjectsForPlanningGrid(feature_class_name).then((projects) => {
        //if the planning grid is not being used then delete it
        if (projects.length === 0) {
          this.deletePlanningGrid(feature_class_name, false);
        } else {
          //show the projects list dialog
          this.showProjectListDialog(
            projects,
            "Failed to delete planning grid",
            "The planning grid is used in the following projects"
          );
        }
      });
    }
  }

  //deletes a planning grid
  deletePlanningGrid(feature_class_name, silent) {
    this._get("deletePlanningUnitGrid?planning_grid_name=" + feature_class_name)
      .then((response) => {
        //update the planning unit grids
        this.getPlanningUnitGrids();
        this.setSnackBar(response.info, silent);
      })
      .catch((error) => {
        //additional stuff
      });
  }

  //exports a planning grid to a zipped shapefile
  exportPlanningGrid(feature_class_name) {
    return new Promise((resolve, reject) => {
      this._get("exportPlanningUnitGrid?name=" + feature_class_name)
        .then((response) => {
          resolve(
            this.state.marxanServer.endpoint + "exports/" + response.filename
          );
        })
        .catch((error) => {
          reject();
        });
    });
  }

  //gets a list of projects that use a particular planning grid
  getProjectsForPlanningGrid(feature_class_name) {
    return new Promise((resolve, reject) => {
      //get a list of the projects for the planning grid
      this._get(
        "listProjectsForPlanningGrid?feature_class_name=" + feature_class_name
      ).then((response) => {
        resolve(response.projects);
      });
    });
  }

  getCountries() {
    this._get("getCountries").then((response) => {
      setDialogsState(prevState => ({ ...prevState, countries: response.records });
    });
  }

  //uploads the named feature class to mapbox on the server
  uploadToMapBox(feature_class_name, mapbox_layer_name) {
    return new Promise((resolve, reject) => {
      this._get(
        "uploadTilesetToMapBox?feature_class_name=" +
          feature_class_name +
          "&mapbox_layer_name=" +
          mapbox_layer_name,
        300000
      )
        .then((response) => {
          setDialogsState(prevState => ({ ...prevState, loading: true });
          //poll mapbox to see when the upload has finished
          this.pollMapbox(response.uploadid).then((response2) => {
            resolve(response2);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //polls mapbox to see when an upload has finished - returns as promise
  pollMapbox(uploadid) {
    setDialogsState(prevState => ({ ...prevState, uploading: true });
   messageLogger({ info: "Uploading to Mapbox..", status: "Uploading" });
    return new Promise((resolve, reject) => {
      if (uploadid === "0") {
       messageLogger({
          info: "Tileset already exists on Mapbox",
          status: "UploadComplete",
        });
        //reset state
        setDialogsState(prevState => ({ ...prevState, uploading: false });
        resolve("Uploaded to Mapbox");
      } else {
        let timer = setInterval(() => {
          console.log(
            "sk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiY2piNm1tOGwxMG9lajMzcXBlZDR4aWVjdiJ9.Z1Jq4UAgGpXukvnUReLO1g ",
            this.state.registry.MBAT ===
              "sk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiY2piNm1tOGwxMG9lajMzcXBlZDR4aWVjdiJ9.Z1Jq4UAgGpXukvnUReLO1g"
          );
          fetch(
            "https://api.mapbox.com/uploads/v1/" +
              CONSTANTS.MAPBOX_USER +
              "/" +
              uploadid +
              "?access_token=" +
              this.state.registry.MBAT
            // should be this - sk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiY2piNm1tOGwxMG9lajMzcXBlZDR4aWVjdiJ9.Z1Jq4UAgGpXukvnUReLO1g
          )
            .then((response) => response.json())
            .then((response) => {
              if (response.complete) {
                resolve("Uploaded to Mapbox");
               messageLogger({ info: "Uploaded", status: "UploadComplete" });
                //clear the timer
                this.clearMapboxTimer(uploadid);
              }
              //if there is an error from mapbox then raise it
              if (response.error) {
                reject(response.error);
                let err =
                  "Mapbox upload error: " +
                  response.error +
                  ". See <a href='" +
                  CONSTANTS.ERRORS_PAGE +
                  "#mapbox-upload-error' target='blank'>here</a>";
                //log the error
               messageLogger({ error: err, status: "UploadFailed" });
                //set the snackbox
                this.setSnackBar(err);
                //clear the timer
                this.clearMapboxTimer(uploadid);
              }
            })
            .catch((error) => {
              setDialogsState(prevState => ({ ...prevState, uploading: false });
              reject(error);
            });
        }, 3000);
        timers.push({ uploadid: uploadid, timer: timer });
      }
    });
  }
  //resets a timer for a mapbox upload poll
  clearMapboxTimer(uploadid) {
    //clear the timer
    let _timer = timers.find((timer) => timer.uploadid === uploadid);
    clearInterval(_timer.timer);
    //remove the timer from the timers array
    timers = timers.filter((timer) => timer.uploadid !== uploadid);
    //reset state
    if (timers.length === 0) setDialogsState(prevState => ({ ...prevState, uploading: false });
  }

  openWelcomeDialog() {
    parseNotifications();
    setDialogsState(prevState => ({ ...prevState, welcomeDialogOpen: true }));
  }
  openFeaturesDialog(showClearSelectAll) {
    //refresh the features list if we are using a hosted service (other users could have created/deleted items) and the project is not imported (only project features are shown)
    if (
      this.state.marxanServer.system !== "Windows" &&
      !this.state.metadata.OLDVERSION
    )
      this.refreshFeatures();
    setDialogsState(prevState => ({ ...prevState,
      featuresDialogOpen: true,
      addingRemovingFeatures: showClearSelectAll,
    });
    if (showClearSelectAll) this.getSelectedFeatureIds();
  }

  updateState(state_obj) {
    setDialogsState(state_obj);
  }

  closeNewFeatureDialog() {
    setDialogsState(prevState => ({ ...prevState, NewFeatureDialogOpen: false });
    //finalise digitising
    this.finaliseDigitising();
  }
  openPlanningGridsDialog() {
    //refresh the planning grids if we are using a hosted service - other users could have created/deleted items
    if (this.state.marxanServer.system !== "Windows")
      this.getPlanningUnitGrids();
    setDialogsState(prevState => ({ ...prevState, planningGridsDialogOpen: true });
  }

  //used by the import wizard to import a users zipped shapefile as the planning units
  importZippedShapefileAsPu(zipname, alias, description) {
    //the zipped shapefile has been uploaded to the MARXAN folder - it will be imported to PostGIS and a record will be entered in the metadata_planning_units table
    return this._get(
      "importPlanningUnitGrid?filename=" +
        zipname +
        "&name=" +
        alias +
        "&description=" +
        description
    );
  }
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// CUMULATIVE IMPACT
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
  openAtlasLayersDialog() {
    //refresh the planning grids if we are using a hosted service - other users could have created/deleted items
    if (this.state.atlasLayers.length < 1) {
      this.getAtlasLayers();
    }
    setDialogsState(prevState => ({ ...prevState, atlasLayersDialogOpen: true });
  }
  openCumulativeImpactDialog() {
    //refresh the planning grids if we are using a hosted service - other users could have created/deleted items
    // if (this.state.marxanServer.system !== "Windows") this.getPlanningUnitGrids();
    this.getImpacts();
    setDialogsState(prevState => ({ ...prevState, cumulativeImpactDialogOpen: true });
  }
  //makes a call to get the impacts from the server and returns them
  getImpacts() {
    console.log("getting impacts...");
    return new Promise((resolve, reject) => {
      this._get("getAllImpacts")
        .then((response) => {
          console.log("response ", response);

          setDialogsState(prevState => ({ ...prevState,
            allImpacts: response.data,
          });
          resolve();
        })
        .catch((error) => {
          //do something
        });
    });
  }

  getOceanBaseMap() {
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

  getAtlasLayers() {
    fetch(this.state.marxanServer.endpoint + "getAtlasLayers", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        let parseddata = data.map(JSON.parse);
        parseddata.forEach((layer) => {
          this.map.addSource(layer.layer, {
            type: "raster",
            tiles: [
              "http://www.atlas-horizon2020.eu/gs/ows?layers=" +
                layer.layer +
                "&service=WMS&request=GetMap&format=image/png&transparent=true&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}",
            ],
            tileSize: 256,
          });
          this.map.addLayer({
            id: layer.layer,
            type: "raster",
            source: layer.layer,
            layout: {
              // make layer visible by default
              visibility: "none",
            },
          });
          // setDialogsState(prevState => ({ ...prevState, map: map });
        });
        setDialogsState(prevState => ({ ...prevState, atlasLayers: parseddata });
      })
      .catch((error) => console.error("Error:", error));
  }

  getActivities() {
    return new Promise((resolve, reject) => {
      this._get("getActivities")
        .then((response) => JSON.parse(response.data))
        .then((data) => {
          setDialogsState(prevState => ({ ...prevState,
            activities: data,
            fetched: true,
          });
          resolve();
        })
        .catch((error) => {
          //do something
        });
    });
  }

  openImportedActivitesDialog() {
    this.getUploadedActivities();
    setDialogsState(prevState => ({ ...prevState, importedActivitiesDialogOpen: true });
  }

  openCostsDialog() {
    this.getImpacts();
    setDialogsState(prevState => ({ ...prevState, costsDialogOpen: true });
  }

  getUploadedActivities() {
    return new Promise((resolve, reject) => {
      this._get("getUploadedActivities")
        .then((response) => {
          console.log("response ", response);
          setDialogsState(prevState => ({ ...prevState,
            uploadedActivities: response.data,
            fetched: true,
          });
          resolve();
        })
        .catch((error) => {
          //do something
        });
    });
  }

  clearSelactedLayers() {
    let layers = [...this.state.selectedLayers];
    layers.forEach((layer) => {
      this.setselectedLayers(layer);
    });
    this.closeAtlasLayersDialog();
  }

  setselectedLayers(layer) {
    // Check if the layer is visibile or not. Toggle it based on this check
    // Check if this layer is in the seletced layers. If it is remove it else add it
    let visibility =
      this.map.getLayoutProperty(layer, "visibility") === "visible"
        ? "none"
        : "visible";
    this.map.setLayoutProperty(layer, "visibility", visibility);
    this.state.selectedLayers.includes(layer)
      ? setDialogsState((prevState) => ({
          selectedLayers: [...prevState.selectedLayers].filter(
            (item) => item !== layer
          ),
        }))
      : setDialogsState((prevState) => ({
          selectedLayers: [...prevState.selectedLayers, layer],
        }));
  }

  closeAtlasLayersDialog() {
    setDialogsState(prevState => ({ ...prevState, atlasLayersDialogOpen: false });
  }

  //when a user clicks a impact in the ImpactsDialog
  clickImpact(impact, event, previousRow) {
    this.state.selectedImpactIds.includes(impact.id)
      ? this.removeImpact(impact)
      : this.addImpact(impact);
    this.toggleImpactLayer(impact);
  }

  //adds a impact to the selectedImpactIds array
  addImpact(impact, callback) {
    setDialogsState((prevState) => ({
      selectedImpactIds: [...prevState.selectedImpactIds, impact.id],
    }));
  }

  //removes a impact from the selectedImpactIds array
  removeImpact(impact) {
    setDialogsState((prevState) => ({
      selectedImpactIds: prevState.selectedImpactIds.filter(
        (imp) => imp !== impact.id
      ),
    }));
  }

  //toggles the impact layer on the map
  toggleImpactLayer(impact) {
    if (impact.tilesetid === "") {
      this.setSnackBar(
        "This impact does not have a tileset on Mapbox. See <a href='" +
          CONSTANTS.ERRORS_PAGE +
          "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>"
      );
      return;
    }
    // this.closeImpactMenu();
    let layerName = impact.tilesetid.split(".")[1];
    let layerId = "marxan_impact_layer_" + layerName;
    if (this.map.getLayer(layerId)) {
      this.removeMapLayer(layerId);
      this.map.removeSource(layerId);
      this.updateImpact(impact, { impact_layer_loaded: false });
    } else {
      //if a planning units layer for a impact is visible then we need to add the impact layer before it - first get the impact puid layer
      var layers = this.getLayers([
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ]);
      //get the before layer
      let beforeLayer = layers.length > 0 ? layers[0].id : "";
      let rasterLayer = {
        id: layerId,
        metadata: {
          name: impact.alias,
          type: "impact",
        },
        type: "raster",
        source: {
          type: "raster",
          tiles: [
            "https://api.mapbox.com/v4/" +
              impact.tilesetid +
              "/{z}/{x}/{y}.png256?access_token=pk.eyJ1IjoiY3JhaWNlcmphY2siLCJhIjoiY2syeXhoMjdjMDQ0NDNnbDk3aGZocWozYiJ9.T-XaC9hz24Gjjzpzu6RCzg",
          ],
        },
        layout: {
          visibility: "visible",
        },
        "source-layer": layerName,
        paint: { "raster-opacity": 0.85 },
      };
      this.addMapLayer(rasterLayer, beforeLayer);
      this.updateImpact(impact, { impact_layer_loaded: true });
    }
  }

  //gets the ids of the selected impacts
  getSelectedImpactIds() {
    let ids = [];
    this.state.allImpacts.forEach((impact) => {
      if (impact.selected) ids.push(impact.id);
    });
    setDialogsState(prevState => ({ ...prevState, selectedImpactIds: ids });
  }

  //updates the properties of a impact and then updates the impacts state
  updateImpact(impact, newProps) {
    let impacts = this.state.allImpacts;
    //get the position of the impact
    var index = impacts.findIndex((element) => {
      return element.id === impact.id;
    });
    if (index !== -1) {
      Object.assign(impacts[index], newProps);
      //update allImpacts and projectImpacts with the new value
      this.setImpactsState(impacts);
    }
  }

  //the callback is optional and will be called when the state has updated
  setImpactsState(newImpacts, callback) {
    //update allImpacts and projectImpacts with the new value
    setDialogsState(
      {
        allImpacts: newImpacts,
        projectImpacts: newImpacts.filter((item) => {
          return item.selected;
        }),
      },
      callback
    );
  }

  openHumanActivitiesDialog() {
    if (this.state.activities.length < 1) {
      this.getActivities();
    }
    setDialogsState(prevState => ({ ...prevState, humanActivitiesDialogOpen: true });
  }

  closeHumanActivitiesDialog() {
    setDialogsState(prevState => ({ ...prevState, humanActivitiesDialogOpen: false });
  }

  //create new impact from the created pressures
  importImpacts(filename, selectedActivity, description) {
    //start the logging
    setDialogsState(prevState => ({ ...prevState, loading: true });
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      let url =
        "runCumumlativeImpact?filename=" +
        filename +
        "&activity=" +
        selectedActivity +
        "&description=" +
        description;
      //get the message and pass it to the msgCallback function
      this._ws(url, this.wsMessageCallback.bind(this))
        .then((message) => {
          this.pollMapbox(message.uploadId).then((response) => {
            setDialogsState(prevState => ({ ...prevState, loading: false }));
            resolve("Cumulative Impact Layer uploaded");
          });
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  runCumulativeImpact(selectedUploadedActivityIds) {
    setDialogsState(prevState => ({ ...prevState, loading: true });
    this.startLogging();
    return new Promise((resolve, reject) => {
      this._ws(
        "runCumumlativeImpact?selectedIds=" + selectedUploadedActivityIds,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          // this.pollMapbox(message.uploadId).then((response) => {
          setDialogsState(prevState => ({ ...prevState, loading: false }));
          resolve("Cumulative Impact Layer uploaded");
          // });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  uploadRaster(data) {
    console.log("upload raster ata ", data);
    return new Promise((resolve, reject) => {
      setDialogsState(prevState => ({ ...prevState, loading: true });
     messageLogger({
        method: "uploadRaster",
        status: "In Progress",
        info: "Uploading Raster...",
      });
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      console.log("formData ", formData);

      //the binary data for the file
      //the filename
      this._post("uploadRaster", formData).then(function (response) {
        console.log("response ", response);
        resolve(response);
      });
    });
  }

  openActivitiesDialog() {
    //refresh the planning grids if we are using a hosted service - other users could have created/deleted items
    // if (this.state.marxanServer.system !== "Windows") this.getPlanningUnitGrids();
    this.getUploadedActivities();
    setDialogsState(prevState => ({ ...prevState, activitiesDialogOpen: true });
  }

  //create new impact from the created pressures
  saveActivityToDb(filename, selectedActivity, description) {
    //start the logging
    setDialogsState(prevState => ({ ...prevState, loading: true });
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      let url =
        "saveRaster?filename=" +
        filename +
        "&activity=" +
        selectedActivity +
        "&description=" +
        description;
      //get the message and pass it to the msgCallback function
      this._ws(url, this.wsMessageCallback.bind(this))
        .then((message) => {
          console.log("message ", message);
          setDialogsState(prevState => ({ ...prevState, loading: false }));
          resolve("Raster saved to db");
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  createCostsFromImpact(data) {
    console.log(
      "this.state.metadata.PLANNING_UNIT_NAME ",
      this.state.metadata.PLANNING_UNIT_NAME
    );
    setDialogsState(prevState => ({ ...prevState, loading: true });
    this.startLogging();
    return new Promise((resolve, reject) => {
      let url =
        "createCostsFromImpact?user=" +
        this.state.owner +
        "&project=" +
        this.state.project +
        "&pu_filename=" +
        this.state.metadata.PLANNING_UNIT_NAME +
        "&impact_filename=" +
        data.feature_class_name +
        "&impact_type=" +
        data.alias;
      this._ws(url, this.wsMessageCallback.bind(this))
        .then((message) => {
          console.log("message ", message);
          setDialogsState(prevState => ({ ...prevState, loading: false }));
          this.addCost(data.alias);
          resolve("Costs created from Cumulative impact");
        })
        .catch((error) => {
          reject(error);
        });
    });
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
  updateFeature(feature, newProps) {
    let features = this.state.allFeatures;
    //get the position of the feature
    var index = features.findIndex((element) => {
      return element.id === feature.id;
    });
    if (index !== -1) {
      Object.assign(features[index], newProps);
      //update allFeatures and projectFeatures with the new value
      this.setFeaturesState(features);
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
  clickFeature(feature) {
    let ids = this.state.selectedFeatureIds;
    if (ids.includes(feature.id)) {
      //remove the feature if it is already selected
      this.removeFeature(feature);
    } else {
      //add the feature to the selected feature array
      this.addFeature(feature);
    }
  }

  //removes a feature from the selectedFeatureIds array  
const removeFeature = (feature) => {
  return new Promise((resolve, reject) => {
    const updatedFeatureIds = dialogsState.selectedFeatureIds.filter(id => id !== feature.id);
    setDialogsState(prevState => {
      return { ...prevState, selectedFeatureIds: updatedFeatureIds };
    }, () => {
      // State update callback
      resolve("Feature removed");
    });
  });
};



  //adds a feature to the selectedFeatureIds array
  addFeature(feature, callback) {
    let ids = this.state.selectedFeatureIds;
    //add the feautre to the selected feature array
    ids.push(feature.id);
    setDialogsState(prevState => ({ ...prevState, selectedFeatureIds: ids }, callback);
  }

  //starts a digitising session
  initialiseDigitising() {
    //show the digitising controls if they are not already present, mapbox-gl-draw-cold and mapbox-gl-draw-hot
    if (!this.map.getSource("mapbox-gl-draw-cold"))
      this.map.addControl(this.mapboxDrawControls);
  }

  //finalises the digitising
  finaliseDigitising() {
    //hide the drawing controls
    this.map.removeControl(this.mapboxDrawControls);
  }
  //called when the user has drawn a polygon on screen
  polygonDrawn(evt) {
    //open the new feature dialog for the metadata
    this.updateState({ NewFeatureDialogOpen: true });
    //save the feature in a local variable
    this.digitisedFeatures = evt.features;
  }

  //selects all the features
  selectAllFeatures() {
    let ids = [];
    this.state.allFeatures.forEach((feature) => {
      ids.push(feature.id);
    });
    this.updateState({ selectedFeatureIds: ids });
  }

  //updates the allFeatures to set the various properties based on which features have been selected in the FeaturesDialog or programmatically
  updateSelectedFeatures() {
    //delete the gap analysis as the features within the project have changed
    this.deleteGapAnalysis();
    let allFeatures = this.state.allFeatures;
    allFeatures.forEach((feature) => {
      if (this.state.selectedFeatureIds.includes(feature.id)) {
        Object.assign(feature, { selected: true });
      } else {
        if (this.state.metadata.OLDVERSION) {
          //for imported projects we cannot preprocess them any longer as we dont have access to the features spatial data - therefore dont set preprocessed to false or any of the other stats fields
          Object.assign(feature, { selected: false });
        } else {
          Object.assign(feature, {
            selected: false,
            preprocessed: false,
            protected_area: -1,
            pu_area: -1,
            pu_count: -1,
            target_area: -1,
            occurs_in_planning_grid: false,
          });
        }
        //remove the feature layer if it is loaded
        if (feature.feature_layer_loaded) this.toggleFeatureLayer(feature);
        //remove the planning unit layer if it is loaded
        if (feature.feature_puid_layer_loaded)
          this.toggleFeaturePUIDLayer(feature);
      }
    });
    //when the project features have been saved to state, update the spec.dat file
    this.setFeaturesState(allFeatures, () => {
      //persist the changes to the server
      if (this.state.userData.ROLE !== "ReadOnly") this.updateSpecFile();
      //close the dialog
      this.updateState({
        featuresDialogOpen: false,
        newFeaturePopoverOpen: false,
        importFeaturePopoverOpen: false,
      });
    });
  }

  //updates the target values for all features in the project to the passed value
  updateTargetValueForFeatures(target_value) {
    let allFeatures = this.state.allFeatures;
    //iterate through all features
    allFeatures.forEach((feature) => {
      Object.assign(feature, { target_value: target_value });
    });
    //set the features in app state
    this.setFeaturesState(allFeatures, () => {
      //persist the changes to the server
      if (this.state.userData.ROLE !== "ReadOnly") this.updateSpecFile();
    });
  }

  //the callback is optional and will be called when the state has updated
  setFeaturesState(newFeatures, callback) {
    //update allFeatures and projectFeatures with the new value
    setDialogsState(
      {
        allFeatures: newFeatures,
        projectFeatures: newFeatures.filter((item) => {
          return item.selected;
        }),
      },
      callback
    );
  }

  //unselects a single Conservation feature
  unselectItem(feature) {
    //remove it from the selectedFeatureIds array
    this.removeFeature(feature).then(() => {
      //refresh the selected features
      this.updateSelectedFeatures();
    });
  }

  //previews the feature
  previewFeature(feature_metadata) {
    setDialogsState(prevState => ({ ...prevState,
      feature_metadata: feature_metadata,
      featureDialogOpen: true,
    });
  }

  //unzips a shapefile on the server
  unzipShapefile(filename) {
    return new Promise((resolve, reject) => {
      this._get("unzipShapefile?filename=" + filename)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //deletes a zip file and shapefile (with the *.shp extension)
  deleteShapefile(zipfile, shapefile) {
    return new Promise((resolve, reject) => {
      this._get(
        "deleteShapefile?zipfile=" + zipfile + "&shapefile=" + shapefile
      )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //gets a list of fieldnames from the passed shapefile - this must exist in the servers root directory
  getShapefileFieldnames(filename) {
    return new Promise((resolve, reject) => {
      this._get("getShapefileFieldnames?filename=" + filename)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //create new features from the already uploaded zipped shapefile
  importFeatures(zipfile, name, description, shapefile, spiltfield) {
    //start the logging
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      let url =
        name !== ""
          ? "importFeatures?zipfile=" +
            zipfile +
            "&shapefile=" +
            shapefile +
            "&name=" +
            name +
            "&description=" +
            description
          : "importFeatures?zipfile=" +
            zipfile +
            "&shapefile=" +
            shapefile +
            "&splitfield=" +
            spiltfield;
      this._ws(url, this.wsMessageCallback.bind(this))
        .then((message) => {
          //get the uploadIds
          let uploadIds = message.uploadIds;
          //get a promise array to see when all of the uploads are done
          let promiseArray = [];
          //iterate through the uploadIds to see when they are done
          for (var i = 0; i < uploadIds.length; ++i) {
            promiseArray.push(this.pollMapbox(uploadIds[i]));
          }
          //see when they're done
          Promise.all(promiseArray).then((response) => {
            resolve("All features uploaded");
          });
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  //imports features from a web resource
  importFeaturesFromWeb(name, description, endpoint, srs, featureType) {
    //start the logging
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      this._ws(
        "createFeaturesFromWFS?name=" +
          name +
          "&description=" +
          description +
          "&endpoint=" +
          endpoint +
          "&srs=" +
          srs +
          "&featuretype=" +
          featureType,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //get the uploadId
          let uploadId = message.uploadId;
          this.pollMapbox(uploadId).then((response) => {
            resolve(response);
          });
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  //import features from GBIF
  importGBIFData(item) {
    //start the logging
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      this._ws(
        "importGBIFData?taxonKey=" +
          item.key +
          "&scientificName=" +
          item.scientificName,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //get the uploadId
          let uploadId = message.uploadId;
          this.pollMapbox(uploadId).then((response) => {
            resolve(response);
          });
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  //requests matching species names in GBIF
  gbifSpeciesSuggest(q) {
    return new Promise((resolve, reject) => {
      setDialogsState(prevState => ({ ...prevState, loading: true });
      jsonp(
        "https://api.gbif.org/v1/species/suggest?q=" + q + "&rank=SPECIES"
      ).promise.then(
        (response) => {
          resolve(response);
          setDialogsState(prevState => ({ ...prevState, loading: false }));
        },
        (err) => {
          reject(err);
          setDialogsState(prevState => ({ ...prevState, loading: false }));
        }
      );
    });
  }

  //create the new feature from the feature that has been digitised on the map
  createNewFeature(name, description) {
    //start the logging
    this.startLogging();
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
      .map((coordinate) => {
        return coordinate[0] + " " + coordinate[1];
      })
      .join(",");
    formData.append("linestring", "Linestring(" + coords + ")");
    this._post("createFeatureFromLinestring", formData)
      .then((response) => {
       messageLogger({
          method: "createNewFeature",
          status: "Finished",
          info: response.info,
        });
        //start polling to see when the upload is done
        this.pollMapbox(response.uploadId).then(() => {
          this.newFeatureCreated(response.id);
          //close the dialog
          this.closeNewFeatureDialog();
        });
      })
      .catch((error) => {
       messageLogger({ status: "Finished", error: error });
      });
  }

  //gets the new feature information and updates the state
  newFeatureCreated(id) {
    //load the interest feature from the marxan web database
    this._get("getFeature?oid=" + id + "&format=json").then((response) => {
      let feature = response.data[0];
      //add the required attributes to use it in Marxan Web and update the allFeatures array
      this.initialiseNewFeature(feature);
      //if add to project is set then add the feature to the project, wait for the selectedFeatureIds state to be updated and then call updateSelectedFeatures
      if (this.state.addToProject)
        this.addFeature(feature, () => {
          this.updateSelectedFeatures();
        });
    });
  }

  //adds the required attributes to use it in Marxan Web and update the allFeatures array
  initialiseNewFeature(feature) {
    //add the required attributes
    addFeatureAttributes(feature);
    //update the allFeatures array
    this.addNewFeature(feature);
  }
  //adds a new feature to the allFeatures array
  addNewFeature(feature) {
    //update the allFeatures array
    var featuresCopy = this.state.allFeatures;
    featuresCopy.push(feature);
    //sort the features alphabetically
    featuresCopy.sort((a, b) => {
      if (a.alias.toLowerCase() < b.alias.toLowerCase()) return -1;
      if (a.alias.toLowerCase() > b.alias.toLowerCase()) return 1;
      return 0;
    });
    setDialogsState(prevState => ({ ...prevState, allFeatures: featuresCopy });
  }

  //attempts to delete a feature - if the feature is in use in a project then it will not be deleted and the list of projects will be shown
const deleteFeature = (feature) => {
    this.getProjectsForFeature(feature).then((projects) => {
      if (projects.length === 0) {
        this._deleteFeature(feature);
      } else {
        this.showProjectListDialog(
          projects,
          "Failed to delete planning feature",
          "The feature is used in the following projects"
        );
      }
    });
  }
  
const deleteFeature = async (feature) => {
  try {
    // Fetch projects associated with the feature
    const projects = await this.getProjectsForFeature(feature);

    // Check if there are any projects using the feature
    if (projects.length === 0) {
      // No projects using the feature, proceed with deletion
      await this._deleteFeature(feature);
    } else {
      // Projects using the feature, show dialog to the user
      this.showProjectListDialog(
        projects,
        "Failed to delete planning feature",
        "The feature is used in the following projects"
      );
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error deleting feature:", error);
    // Optionally: show error feedback to the user
    this.setSnackBar("Failed to delete feature due to an error.");
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
  toggleFeatureLayer(feature) {
    if (feature.tilesetid === "") {
      this.setSnackBar(
        "This feature does not have a tileset on Mapbox. See <a href='" +
          CONSTANTS.ERRORS_PAGE +
          "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>"
      );
      return;
    }
    // this.closeFeatureMenu();
    let layerName = feature.tilesetid.split(".")[1];
    let layerId = "marxan_feature_layer_" + layerName;
    if (this.map.getLayer(layerId)) {
      this.removeMapLayer(layerId);
      this.map.removeSource(layerId);
      this.updateFeature(feature, { feature_layer_loaded: false });
    } else {
      //if a planning units layer for a feature is visible then we need to add the feature layer before it - first get the feature puid layer
      var layers = this.getLayers([
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ]);
      //get the before layer
      let beforeLayer = layers.length > 0 ? layers[0].id : "";
      //get the paint property
      let paintProperty, typeProperty;
      if (feature.source !== "Imported shapefile (points)") {
        paintProperty = {
          "fill-color": feature.color,
          "fill-opacity": CONSTANTS.FEATURE_LAYER_OPACITY,
          "fill-outline-color": "rgba(0, 0, 0, 0.2)",
        };
        typeProperty = "fill";
      } else {
        paintProperty = {
          "circle-color": feature.color,
          "circle-opacity": CONSTANTS.FEATURE_LAYER_OPACITY,
          "circle-stroke-color": "rgba(0, 0, 0, 0.7)",
          "circle-radius": 3,
        };
        typeProperty = "circle";
      }
      this.addMapLayer(
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
      this.updateFeature(feature, { feature_layer_loaded: true });
    }
  }

  //toggles the planning unit feature layer on the map
  toggleFeaturePUIDLayer(feature) {
    // this.closeFeatureMenu();
    let layerName = "marxan_puid_" + feature.id;
    if (this.map.getLayer(layerName)) {
      this.removeMapLayer(layerName);
      this.updateFeature(feature, { feature_puid_layer_loaded: false });
    } else {
      //get the planning units where the feature occurs
      this._get(
        "getFeaturePlanningUnits?user=" +
          this.state.owner +
          "&project=" +
          this.state.project +
          "&oid=" +
          feature.id
      ).then((response) => {
        //ids retrieved - add the layer
        this.addMapLayer({
          id: layerName,
          metadata: {
            name: feature.alias,
            type: CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
            lineColor: feature.color,
          },
          type: "line",
          source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
          "source-layer": this.state.tileset.name,
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-opacity": CONSTANTS.FEATURE_PLANNING_GRID_LAYER_OPACITY,
          },
        });
        //update the paint property for the layer
        var line_color_expression = this.initialiseFillColorExpression("puid");
        response.data.forEach((puid) => {
          line_color_expression.push(puid, feature.color);
        });
        // Last value is the default, used where there is no data
        line_color_expression.push("rgba(0,0,0,0)");
        this.map.setPaintProperty(
          layerName,
          "line-color",
          line_color_expression
        );
        //show the layer
        this.showLayer(layerName);
      });
      this.updateFeature(feature, { feature_puid_layer_loaded: true });
    }
  }

  //removes the current feature from the project
  removeFromProject(feature) {
    this.closeFeatureMenu();
    this.unselectItem(feature);
  }

  //zooms to a features extent
  zoomToFeature(feature) {
    this.closeFeatureMenu();
    //transform from BOX(-174.173506487 -18.788241791,-173.86528589 -18.5190063499999) to [[-73.9876, 40.7661], [-73.9397, 40.8002]]
    let points = feature.extent
      .substr(4, feature.extent.length - 5)
      .replace(/ /g, ",")
      .split(",");
    //get the points as numbers
    let nums = points.map((item) => {
      return Number(item);
    });
    //zoom to the feature
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
    this.getCountries();
    setDialogsState(prevState => ({ ...prevState, newProjectWizardDialogOpen: true }));
  }

  openNewPlanningGridDialog() {
    this.getCountries();
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
    setDialogsState(prevState => ({ ...prevState, infoPanelOpen: !this.state.infoPanelOpen }));
  }
  toggleResultsPanel() {
    setDialogsState(prevState => ({ ...prevState, resultsPanelOpen: !this.state.resultsPanelOpen }));
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
        this.updateState({ ProjectsListDialogOpen: true });
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
    let _metadata = this.state.metadata;
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
    //let filterExpr = (this.state.metadata.PLANNING_UNIT_NAME.match(/_/g).length> 1) ? ['all', ['in', 'IUCN_CAT'].concat(iucnCategories), ['==', 'PARENT_ISO', this.state.metadata.PLANNING_UNIT_NAME.substr(3, 3).toUpperCase()]] : ['all', ['in', 'IUCN_CAT'].concat(iucnCategories)];
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
    let statuses = this.state.planning_units;
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
    this.renderPuEditLayer();
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
    if (this.state.protected_area_intersections.length > 0) {
      return Promise.resolve(this.state.protected_area_intersections);
    } else {
      //do the intersection on the server
      return new Promise((resolve, reject) => {
        //start the logging
        this.startLogging();
        //call the websocket
        this._ws(
          "preprocessProtectedAreas?user=" +
            this.state.owner +
            "&project=" +
            this.state.project +
            "&planning_grid_name=" +
            this.state.metadata.PLANNING_UNIT_NAME,
          this.wsMessageCallback.bind(this)
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
    return this.state.protected_area_intersections.filter((item) => {
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
          this.state.registry.WDPA.downloadUrl +
          "&wdpaVersion=" +
          this.state.registry.WDPA.latest_version,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //websocket has finished - set the new version of the wdpa
          let obj = Object.assign(this.state.marxanServer, {
            wdpa_version: this.state.registry.WDPA.latest_version,
          });
          //update the state and when it is finished, re-add the wdpa source and layer
          setDialogsState(prevState => ({ ...prevState, newWDPAVersion: false, marxanServer: obj }, () => {
            //set the source for the WDPA layer to the new vector tiles
            this.setWDPAVectorTilesLayerName(
              this.state.registry.WDPA.latest_version
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
            this.changeIucnCategory(this.state.metadata.IUCN_CATEGORY);
            //close the dialog
            this.updateState({ updateWDPADialogOpen: false });
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
    if (this.state.files.BOUNDNAME) {
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
            this.state.owner +
            "&project=" +
            this.state.project,
          this.wsMessageCallback.bind(this)
        )
          .then((message) => {
            //update the state
            var currentFiles = this.state.files;
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
          this.state.owner +
          "&project=" +
          this.state.project +
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

  runProjects(projects) {
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
            this.loadOtherSolution(response.user, response.project, 1);
          }
          //increment the project counter
          this.projectsRun = this.projectsRun + 1;
          //set the state
          if (this.projectsRun === 5) setDialogsState(prevState => ({ ...prevState, clumpingRunning: false });
        }
      );
    });
  }

  rerunProjects(blmChanged, blmValues) {
    //reset the paint properties in the clumping dialog
    this.resetPaintProperties();
    //if the blmValues have changed then recreate the project group and run
    if (blmChanged) {
      this.createProjectGroupAndRun(blmValues);
    } else {
      //rerun the projects
      this.runProjects(this.projects);
    }
  }

  setBlmValue(blmValue) {
    var newRunParams = [],
      value;
    //iterate through the run parameters and update the value for the blm
    this.state.runParams.forEach((item) => {
      value = item.key === "BLM" ? String(blmValue) : item.value;
      newRunParams.push({ key: item.key, value: value });
    });
    //update this run parameters
    this.updateRunParams(newRunParams);
  }

  resetPaintProperties() {
    //reset the paint properties
    setDialogsState(prevState => ({ ...prevState,
      map0_paintProperty: [],
      map1_paintProperty: [],
      map2_paintProperty: [],
      map3_paintProperty: [],
      map4_paintProperty: [],
    });
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
    if (!this.state.unauthorisedMethods.includes("getRunLogs")) {
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
    this.updateState({ shareableLinkDialogOpen: true });
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
          this.state.owner +
          "&project=" +
          this.state.project,
        this.wsMessageCallback.bind(this)
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
        this.state.owner +
        "&project=" +
        this.state.project
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
          this.state.owner +
          "&project=" +
          this.state.project +
          "&costname=" +
          costname
      )
        .then((response) => {
          //update the state
          setDialogsState(prevState => ({ ...prevState,
            metadata: Object.assign(this.state.metadata, { COSTS: costname }),
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //loads the costs layer
  loadCostsLayer(forceReload = false) {
    setDialogsState(prevState => ({ ...prevState, costsLoading: true });
    this.getPlanningUnitsCostData(forceReload).then((cost_data) => {
      this.renderPuCostLayer(cost_data).then(() => {
        setDialogsState(prevState => ({ ...prevState, costsLoading: false });
        //do something
      });
    });
  }

  //gets the cost data either from cache (if it has already been loaded) or from the server
  getPlanningUnitsCostData(forceReload) {
    let owner = this.state.owner === "" ? this.state.user : this.state.owner;
    console.log("this.state.user ", this.state.user);
    console.log("this.state.owner ", this.state.owner);
    return new Promise((resolve, reject) => {
      //if the cost data has already been loaded
      if (this.cost_data && !forceReload) {
        resolve(this.cost_data);
      } else {
        console.log(
          "getPlanningUnitsCostData --------------------------------------------------- line 5569"
        );
        console.log("this.state ", this.state);
        this._get(
          "getPlanningUnitsCostData?user=" +
            owner +
            "&project=" +
            this.state.project
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
          this.updateState({ importCostsDialogOpen: false });
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  //adds a cost in application state
  addCost(costname) {
    //update the state
    let _costnames = this.state.costnames;
    //add the cost profile
    _costnames.push(costname);
    setDialogsState(prevState => ({ ...prevState, costnames: _costnames });
  }
  //deletes a cost file on the server
  deleteCost(costname) {
    return new Promise((resolve, reject) => {
      this._get(
        "deleteCost?user=" +
          this.state.owner +
          "&project=" +
          this.state.project +
          "&costname=" +
          costname
      )
        .then((response) => {
          //update the state
          let _costnames = this.state.costnames;
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
      this._ws("resetDatabase", this.wsMessageCallback.bind(this))
        .then((message) => {
          //websocket has finished
          resolve(message);
          this.updateState({ resetDialogOpen: false });
        })
        .catch((error) => {
          reject(error);
          this.updateState({ resetDialogOpen: false });
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
        dangerouslySetInnerHTML={{ __html: this.state.snackbarMessage }}
      />
    );
    return (
      // <ThemeProvider>
      <React.Fragment>
        <div
          ref={(el) => (this.mapContainer = el)}
          className="absolute top right left bottom"
        />
        <LoadingDialog open={this.state.shareableLink} />
        <LoginDialog
          open={!this.state.loggedIn}
          validateUser={this.validateUser.bind(this)}
          // onCancel={() => this.updateState({ registerDialogOpen: true })}
          loading={this.state.loading}
          user={this.state.user}
          password={this.state.password}
          changeUserName={changeUserName}
          changePassword={changePassword}
          updateState={this.updateState.bind(this)}
          marxanServers={this.state.marxanServers}
          selectServer={this.selectServer.bind(this)}
          marxanServer={this.state.marxanServer}
          marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
        />
        <RegisterDialog
          open={this.state.registerDialogOpen}
          onOk={handleCreateUser}
          updateState={this.updateState.bind(this)}
          loading={this.state.loading}
        />
        <ResendPasswordDialog
          open={this.state.resendPasswordDialogOpen}
          onOk={this.resendPassword.bind(this)}
          onCancel={() => this.updateState({ resendPasswordDialogOpen: false })}
          loading={this.state.loading}
          changeEmail={this.changeEmail.bind(this)}
          email={this.state.resendEmail}
        />
        <Welcome
          open={
            this.state.userData.SHOWWELCOMESCREEN &&
            this.state.welcomeDialogOpen
          }
          onOk={this.updateState.bind(this)}
          onCancel={() => this.updateState({ welcomeDialogOpen: false })}
          userData={this.state.userData}
          saveOptions={this.saveOptions.bind(this)}
          notifications={this.state.notifications}
          resetNotifications={this.resetNotifications.bind(this)}
          removeNotification={this.removeNotification.bind(this)}
          openNewProjectDialog={this.openNewProjectWizardDialog.bind(this)}
        />
        <ToolsMenu
          open={this.state.toolsMenuOpen}
          menuAnchor={this.state.menuAnchor}
          hideToolsMenu={this.hideToolsMenu.bind(this)}
          openUsersDialog={this.openUsersDialog.bind(this)}
          openRunLogDialog={this.openRunLogDialog.bind(this)}
          openGapAnalysisDialog={this.openGapAnalysisDialog.bind(this)}
          updateState={this.updateState.bind(this)}
          userRole={this.state.userData.ROLE}
          marxanServer={this.state.marxanServer}
          metadata={this.state.metadata}
          cleanup={this.cleanup.bind(this)}
        />
        <UserMenu
          open={this.state.userMenuOpen}
          menuAnchor={this.state.menuAnchor}
          user={this.state.user}
          userRole={this.state.userData.ROLE}
          hideUserMenu={this.hideUserMenu.bind(this)}
          openUserSettingsDialog={this.openUserSettingsDialog.bind(this)}
          openProfileDialog={this.openProfileDialog.bind(this)}
          logout={this.logout.bind(this)}
          marxanServer={this.state.marxanServer}
          openChangePasswordDialog={this.openChangePasswordDialog.bind(this)}
        />
        <HelpMenu
          open={this.state.helpMenuOpen}
          menuAnchor={this.state.menuAnchor}
          hideHelpMenu={this.hideHelpMenu.bind(this)}
          openAboutDialog={this.openAboutDialog.bind(this)}
        />
        <UserSettingsDialog
          open={this.state.UserSettingsDialogOpen}
          onOk={() => this.updateState({ UserSettingsDialogOpen: false })}
          onCancel={() => this.updateState({ UserSettingsDialogOpen: false })}
          loading={this.state.loading}
          userData={this.state.userData}
          saveOptions={this.saveOptions.bind(this)}
          changeBasemap={this.setBasemap.bind(this)}
          basemaps={this.state.basemaps}
          basemap={this.state.basemap}
        />
        <UsersDialog
          open={this.state.usersDialogOpen}
          onOk={() => this.updateState({ usersDialogOpen: false })}
          onCancel={() => this.updateState({ usersDialogOpen: false })}
          loading={this.state.loading}
          user={this.state.user}
          users={this.state.users}
          deleteUser={handleDeleteUser}
          changeRole={this.changeRole.bind(this)}
          guestUserEnabled={this.state.marxanServer.guestUserEnabled}
          toggleEnableGuestUser={this.toggleEnableGuestUser.bind(this)}
        />
        <ProfileDialog
          open={this.state.profileDialogOpen}
          onOk={() => this.updateState({ profileDialogOpen: false })}
          onCancel={() => this.updateState({ profileDialogOpen: false })}
          loading={this.state.loading}
          userData={this.state.userData}
          updateUser={handleUserUpdate}
        />
        <AboutDialog
          open={this.state.aboutDialogOpen}
          onOk={() => this.updateState({ aboutDialogOpen: false })}
          marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
          wdpaAttribution={this.state.wdpaAttribution}
        />
        <InfoPanel
          open={this.state.infoPanelOpen}
          activeTab={this.state.activeTab}
          user={this.state.user}
          owner={this.state.owner}
          project={this.state.project}
          metadata={this.state.metadata}
          runMarxan={this.runMarxan.bind(this)}
          stopProcess={this.stopProcess.bind(this)}
          pid={this.state.pid}
          renameProject={this.renameProject.bind(this)}
          renameDescription={this.renameDescription.bind(this)}
          features={this.state.projectFeatures}
          project_tab_active={this.project_tab_active.bind(this)}
          features_tab_active={this.features_tab_active.bind(this)}
          pu_tab_active={this.pu_tab_active.bind(this)}
          startPuEditSession={this.startPuEditSession.bind(this)}
          stopPuEditSession={this.stopPuEditSession.bind(this)}
          puEditing={this.state.puEditing}
          clearManualEdits={this.clearManualEdits.bind(this)}
          openFeatureMenu={this.openFeatureMenu.bind(this)}
          preprocessing={this.state.preprocessing}
          openFeaturesDialog={this.openFeaturesDialog.bind(this)}
          changeIucnCategory={this.changeIucnCategory.bind(this)}
          updateFeature={this.updateFeature.bind(this)}
          userRole={this.state.userData.ROLE}
          toggleProjectPrivacy={this.toggleProjectPrivacy.bind(this)}
          openTargetDialog={this.openTargetDialog.bind(this)}
          getShareableLink={this.getShareableLink.bind(this)}
          marxanServer={this.state.marxanServer}
          toggleFeatureLayer={this.toggleFeatureLayer.bind(this)}
          toggleFeaturePUIDLayer={this.toggleFeaturePUIDLayer.bind(this)}
          useFeatureColors={this.state.userData.USEFEATURECOLORS}
          smallLinearGauge={this.state.smallLinearGauge}
          openCostsDialog={this.openCostsDialog.bind(this)}
          costname={this.state.metadata.COSTS}
          costnames={this.state.costnames}
          changeCostname={this.changeCostname.bind(this)}
          loadCostsLayer={this.loadCostsLayer.bind(this)}
          loading={this.state.loading}
          updateState={this.updateState.bind(this)}
          protected_area_intersections={this.state.protected_area_intersections}
        />
        <ResultsPanel
          open={this.state.resultsPanelOpen}
          preprocessing={this.state.preprocessing}
          solutions={this.state.solutions}
          loadSolution={this.loadSolution.bind(this)}
          openClassificationDialog={this.openClassificationDialog.bind(this)}
          brew={this.state.brew}
          messages={this.state.logMessages}
          activeResultsTab={this.state.activeResultsTab}
          setActiveTab={this.setActiveTab.bind(this)}
          clearLog={this.clearLog.bind(this)}
          owner={this.state.owner}
          resultsLayer={this.state.resultsLayer}
          wdpaLayer={this.state.wdpaLayer}
          pa_layer_visible={this.state.pa_layer_visible}
          changeOpacity={this.changeOpacity.bind(this)}
          userRole={this.state.userData.ROLE}
          visibleLayers={this.state.visibleLayers}
          metadata={this.state.metadata}
          costsLoading={this.state.costsLoading}
        />
        <FeatureInfoDialog
          open={this.state.openInfoDialogOpen}
          onOk={() => this.updateState({ openInfoDialogOpen: false })}
          onCancel={() => this.updateState({ openInfoDialogOpen: false })}
          loading={this.state.loading}
          feature={this.state.currentFeature}
          updateFeature={this.updateFeature.bind(this)}
          userRole={this.state.userData.ROLE}
          reportUnits={this.state.userData.REPORTUNITS}
        />
        <IdentifyPopup
          visible={this.state.identifyVisible}
          xy={this.state.popup_point}
          identifyPlanningUnits={this.state.identifyPlanningUnits}
          identifyProtectedAreas={this.state.identifyProtectedAreas}
          identifyFeatures={this.state.identifyFeatures}
          loading={this.state.loading}
          hideIdentifyPopup={this.hideIdentifyPopup.bind(this)}
          reportUnits={this.state.userData.REPORTUNITS}
          metadata={this.state.metadata}
        />
        <ProjectsDialog
          open={this.state.projectsDialogOpen}
          onCancel={() =>
            this.updateState({
              projectsDialogOpen: false,
              importProjectPopoverOpen: false,
            })
          }
          loading={this.state.loading}
          projects={this.state.projects}
          oldVersion={this.state.metadata.OLDVERSION}
          updateState={this.updateState.bind(this)}
          deleteProject={this.deleteProject.bind(this)}
          loadProject={this.loadProject.bind(this)}
          exportProject={this.exportProject.bind(this)}
          cloneProject={this.cloneProject.bind(this)}
          unauthorisedMethods={this.state.unauthorisedMethods}
          userRole={this.state.userData.ROLE}
          getAllFeatures={this.getAllFeatures.bind(this)}
          importProjectPopoverOpen={this.state.importProjectPopoverOpen}
          importMXWDialogOpen={this.state.importMXWDialogOpen}
        />
        <NewProjectDialog
          open={this.state.newProjectDialogOpen}
          registry={this.state.registry}
          loading={this.state.loading}
          getPlanningUnitGrids={this.getPlanningUnitGrids.bind(this)}
          planning_unit_grids={this.state.planning_unit_grids}
          openFeaturesDialog={this.openFeaturesDialog.bind(this)}
          features={this.state.allFeatures}
          updateState={this.updateState.bind(this)}
          selectedCosts={this.state.selectedCosts}
          createNewProject={this.createNewProject.bind(this)}
          previewFeature={this.previewFeature.bind(this)}
        />
        <NewProjectWizardDialog
          open={this.state.newProjectWizardDialogOpen}
          onOk={() => this.updateState({ newProjectWizardDialogOpen: false })}
          okDisabled={true}
          countries={this.state.countries}
          updateState={this.updateState.bind(this)}
          createNewNationalProject={createNewNationalProject}
        />
        <NewPlanningGridDialog
          open={this.state.NewPlanningGridDialogOpen}
          onCancel={() =>
            this.updateState({ NewPlanningGridDialogOpen: false })
          }
          loading={
            this.state.loading ||
            this.state.preprocessing ||
            this.state.uploading
          }
          createNewPlanningUnitGrid={this.createNewPlanningUnitGrid.bind(this)}
          countries={this.state.countries}
          setSnackBar={this.setSnackBar.bind(this)}
        />
        <NewMarinePlanningGridDialog
          open={this.state.NewMarinePlanningGridDialogOpen}
          onCancel={() =>
            this.updateState({ NewMarinePlanningGridDialogOpen: false })
          }
          loading={
            this.state.loading ||
            this.state.preprocessing ||
            this.state.uploading
          }
          createNewPlanningUnitGrid={this.createNewMarinePlanningUnitGrid.bind(
            this
          )}
          fileUpload={this.uploadFileToFolder.bind(this)}
          setSnackBar={this.setSnackBar.bind(this)}
        />
        <ImportPlanningGridDialog
          open={this.state.importPlanningGridDialogOpen}
          onOk={this.importPlanningUnitGrid.bind(this)}
          onCancel={() =>
            this.updateState({ importPlanningGridDialogOpen: false })
          }
          loading={this.state.loading || this.state.uploading}
          fileUpload={this.uploadFileToFolder.bind(this)}
        />
        <FeaturesDialog
          open={this.state.featuresDialogOpen}
          onOk={this.updateSelectedFeatures.bind(this)}
          loading={this.state.loading || this.state.uploading}
          metadata={this.state.metadata}
          allFeatures={this.state.allFeatures}
          deleteFeature={this.deleteFeature.bind(this)}
          updateState={this.updateState.bind(this)}
          selectAllFeatures={this.selectAllFeatures.bind(this)}
          userRole={this.state.userData.ROLE}
          clickFeature={this.clickFeature.bind(this)}
          addingRemovingFeatures={this.state.addingRemovingFeatures}
          selectedFeatureIds={this.state.selectedFeatureIds}
          initialiseDigitising={this.initialiseDigitising.bind(this)}
          newFeaturePopoverOpen={this.state.newFeaturePopoverOpen}
          importFeaturePopoverOpen={this.state.importFeaturePopoverOpen}
          previewFeature={this.previewFeature.bind(this)}
          marxanServer={this.state.marxanServer}
          refreshFeatures={this.refreshFeatures.bind(this)}
        />
        <FeatureDialog
          open={this.state.featureDialogOpen}
          onOk={() => this.updateState({ featureDialogOpen: false })}
          loading={this.state.loading}
          feature_metadata={this.state.feature_metadata}
          getTilesetMetadata={this.getMetadata.bind(this)}
          setSnackBar={this.setSnackBar.bind(this)}
          reportUnits={this.state.userData.REPORTUNITS}
          getProjectList={getProjectList}
        />
        <NewFeatureDialog
          open={this.state.NewFeatureDialogOpen}
          onOk={this.closeNewFeatureDialog.bind(this)}
          onCancel={this.closeNewFeatureDialog.bind(this)}
          loading={this.state.loading || this.state.uploading}
          createNewFeature={this.createNewFeature.bind(this)}
          addToProject={this.state.addToProject}
          setAddToProject={this.setAddToProject.bind(this)}
        />
        <ImportFeaturesDialog
          open={this.state.importFeaturesDialogOpen}
          importFeatures={this.importFeatures.bind(this)}
          loading={
            this.state.loading ||
            this.state.preprocessing ||
            this.state.uploading
          }
          updateState={this.updateState.bind(this)}
          filename={this.state.featureDatasetFilename}
          fileUpload={this.uploadFileToFolder.bind(this)}
          unzipShapefile={this.unzipShapefile.bind(this)}
          getShapefileFieldnames={this.getShapefileFieldnames.bind(this)}
          deleteShapefile={this.deleteShapefile.bind(this)}
          addToProject={this.state.addToProject}
          setAddToProject={this.setAddToProject.bind(this)}
        />
        <ImportFromWebDialog
          open={this.state.importFromWebDialogOpen}
          onCancel={this.updateState.bind(this)}
          loading={
            this.state.loading ||
            this.state.preprocessing ||
            this.state.uploading
          }
          importFeatures={this.importFeaturesFromWeb.bind(this)}
          addToProject={this.state.addToProject}
          setAddToProject={this.setAddToProject.bind(this)}
        />
        <ImportGBIFDialog
          open={this.state.importGBIFDialogOpen}
          updateState={this.updateState.bind(this)}
          loading={
            this.state.loading ||
            this.state.preprocessing ||
            this.state.uploading
          }
          importGBIFData={this.importGBIFData.bind(this)}
          gbifSpeciesSuggest={this.gbifSpeciesSuggest.bind(this)}
          addToProject={this.state.addToProject}
          setAddToProject={this.setAddToProject.bind(this)}
        />
        <PlanningGridsDialog
          open={this.state.planningGridsDialogOpen}
          updateState={this.updateState.bind(this)}
          loading={this.state.loading}
          getPlanningUnitGrids={this.getPlanningUnitGrids.bind(this)}
          unauthorisedMethods={this.state.unauthorisedMethods}
          planningGrids={this.state.planning_unit_grids}
          openNewPlanningGridDialog={this.openNewPlanningGridDialog.bind(this)}
          exportPlanningGrid={this.exportPlanningGrid.bind(this)}
          deletePlanningGrid={this.deletePlanningUnitGrid.bind(this)}
          previewPlanningGrid={this.previewPlanningGrid.bind(this)}
          marxanServer={this.state.marxanServer}
          fullWidth={true}
          maxWidth="false"
        />
        <PlanningGridDialog
          open={this.state.planningGridDialogOpen}
          onOk={() => this.updateState({ planningGridDialogOpen: false })}
          updateState={this.updateState.bind(this)}
          loading={this.state.loading}
          planning_grid_metadata={this.state.planning_grid_metadata}
          getTilesetMetadata={this.getMetadata.bind(this)}
          setSnackBar={this.setSnackBar.bind(this)}
          getProjectList={getProjectList}
        />
        <ProjectsListDialog
          open={this.state.ProjectsListDialogOpen}
          projects={this.state.projectList}
          userRole={this.state.userData.ROLE}
          onOk={() => this.updateState({ ProjectsListDialogOpen: false })}
          title={this.state.projectListDialogTitle}
          heading={this.state.projectListDialogHeading}
        />
        <CostsDialog
          open={this.state.costsDialogOpen}
          onOk={() => this.updateState({ costsDialogOpen: false })}
          onCancel={() => this.updateState({ costsDialogOpen: false })}
          updateState={this.updateState.bind(this)}
          unauthorisedMethods={this.state.unauthorisedMethods}
          costname={this.state.metadata.COSTS}
          deleteCost={this.deleteCost.bind(this)}
          data={this.state.costnames}
          allImpacts={this.state.allImpacts}
          planningUnitName={this.state.metadata.PLANNING_UNIT_NAME}
          createCostsFromImpact={this.createCostsFromImpact.bind(this)}
        />
        <ImportCostsDialog
          open={this.state.importCostsDialogOpen}
          addCost={this.addCost.bind(this)}
          updateState={this.updateState.bind(this)}
          deleteCostFileThenClose={this.deleteCostFileThenClose.bind(this)}
          loading={this.state.loading}
          fileUpload={this.uploadFileToProject.bind(this)}
        />
        <RunSettingsDialog
          open={this.state.settingsDialogOpen}
          onOk={() => this.updateState({ settingsDialogOpen: false })}
          onCancel={() => this.updateState({ settingsDialogOpen: false })}
          loading={this.state.loading || this.state.preprocessing}
          updateRunParams={this.updateRunParams.bind(this)}
          runParams={this.state.runParams}
          showClumpingDialog={this.showClumpingDialog.bind(this)}
          userRole={this.state.userData.ROLE}
        />
        <ClassificationDialog
          open={this.state.classificationDialogOpen}
          onOk={this.closeClassificationDialog.bind(this)}
          onCancel={this.closeClassificationDialog.bind(this)}
          loading={this.state.loading}
          renderer={this.state.renderer}
          changeColorCode={this.changeColorCode.bind(this)}
          changeRenderer={this.changeRenderer.bind(this)}
          changeNumClasses={this.changeNumClasses.bind(this)}
          changeShowTopClasses={this.changeShowTopClasses.bind(this)}
          summaryStats={this.state.summaryStats}
          brew={this.state.brew}
          dataBreaks={this.state.dataBreaks}
        />
        <ClumpingDialog
          open={this.state.clumpingDialogOpen}
          onOk={this.hideClumpingDialog.bind(this)}
          onCancel={this.hideClumpingDialog.bind(this)}
          tileset={this.state.tileset}
          map0_paintProperty={this.state.map0_paintProperty}
          map1_paintProperty={this.state.map1_paintProperty}
          map2_paintProperty={this.state.map2_paintProperty}
          map3_paintProperty={this.state.map3_paintProperty}
          map4_paintProperty={this.state.map4_paintProperty}
          mapCentre={this.state.mapCentre}
          mapZoom={this.state.mapZoom}
          createProjectGroupAndRun={this.createProjectGroupAndRun.bind(this)}
          rerunProjects={this.rerunProjects.bind(this)}
          setBlmValue={this.setBlmValue.bind(this)}
          clumpingRunning={this.state.clumpingRunning}
        />
        <ImportProjectDialog
          open={this.state.importProjectDialogOpen}
          onOk={() => this.updateState({ importProjectDialogOpen: false })}
          loading={this.state.loading || this.state.uploading}
          importProject={this.importProject.bind(this)}
          fileUpload={this.uploadFileToFolder.bind(this)}
          log={this.log.bind(this)}
          setSnackBar={this.setSnackBar.bind(this)}
        />
        <ImportMXWDialog
          open={this.state.importMXWDialogOpen}
          onOk={() => this.updateState({ importMXWDialogOpen: false })}
          loading={this.state.loading || this.state.preprocessing}
          importMXWProject={this.importMXWProject.bind(this)}
          fileUpload={this.uploadFileToFolder.bind(this)}
          log={this.log.bind(this)}
          setSnackBar={this.setSnackBar.bind(this)}
        />
        <ResetDialog
          open={this.state.resetDialogOpen}
          onOk={this.resetServer.bind(this)}
          onCancel={() => this.updateState({ resetDialogOpen: false })}
          onClose={() => this.updateState({ resetDialogOpen: false })}
          loading={this.state.loading}
        />
        <RunLogDialog
          open={this.state.runLogDialogOpen}
          onOk={this.closeRunLogDialog.bind(this)}
          onClose={this.closeRunLogDialog.bind(this)}
          loading={this.state.loading}
          preprocessing={this.state.preprocessing}
          unauthorisedMethods={this.state.unauthorisedMethods}
          runLogs={this.state.runLogs}
          getRunLogs={this.getRunLogs.bind(this)}
          clearRunLogs={this.clearRunLogs.bind(this)}
          stopMarxan={this.stopProcess.bind(this)}
          userRole={this.state.userData.ROLE}
        />
        <ServerDetailsDialog
          open={this.state.serverDetailsDialogOpen}
          onOk={this.closeServerDetailsDialog.bind(this)}
          onCancel={this.closeServerDetailsDialog.bind(this)}
          onClose={this.closeServerDetailsDialog.bind(this)}
          updateState={this.updateState.bind(this)}
          marxanServer={this.state.marxanServer}
          newWDPAVersion={this.state.newWDPAVersion}
          registry={this.state.registry}
        />
        <UpdateWDPADialog
          open={this.state.updateWDPADialogOpen}
          onOk={() => this.updateState({ updateWDPADialogOpen: false })}
          onCancel={() => this.updateState({ updateWDPADialogOpen: false })}
          newWDPAVersion={this.state.newWDPAVersion}
          updateWDPA={this.updateWDPA.bind(this)}
          loading={this.state.preprocessing}
          registry={this.state.registry}
        />
        <ChangePasswordDialog
          open={this.state.changePasswordDialogOpen}
          onOk={this.closeChangePasswordDialog.bind(this)}
          user={this.state.user}
          onClose={this.closeChangePasswordDialog.bind(this)}
          checkPassword={this.checkPassword.bind(this)}
          setSnackBar={this.setSnackBar.bind(this)}
          updateUser={handleUserUpdate}
        />
        <AlertDialog
          open={this.state.alertDialogOpen}
          onOk={() => this.updateState({ alertDialogOpen: false })}
        />
        <Snackbar
          open={this.state.snackbarOpen}
          message={message}
          onClose={this.closeSnackbar.bind(this)}
          style={{ maxWidth: "800px !important" }}
          bodyStyle={{ maxWidth: "800px !important" }}
        />
        <Popover
          open={this.state.featureMenuOpen}
          anchorEl={this.state.menuAnchor}
          onClose={this.closeFeatureMenu.bind(this)}
          style={{ width: "307px" }}
        >
          <Menu
            style={{ width: "207px" }}
            onMouseLeave={this.closeFeatureMenu.bind(this)}
          >
            <MenuItemWithButton
              leftIcon={<Properties style={{ margin: "1px" }} />}
              onClick={() =>
                this.updateState({
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
                  this.state.currentFeature.old_version ||
                  this.state.userData.ROLE === "ReadOnly"
                    ? "none"
                    : "block",
              }}
              onClick={this.removeFromProject.bind(
                this,
                this.state.currentFeature
              )}
            >
              Remove from project
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={
                this.state.currentFeature.feature_layer_loaded ? (
                  <RemoveFromMap style={{ margin: "1px" }} />
                ) : (
                  <AddToMap style={{ margin: "1px" }} />
                )
              }
              style={{
                display: this.state.currentFeature.tilesetid ? "block" : "none",
              }}
              onClick={this.toggleFeatureLayer.bind(
                this,
                this.state.currentFeature
              )}
            >
              {this.state.currentFeature.feature_layer_loaded
                ? "Remove from map"
                : "Add to map"}
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={
                this.state.currentFeature.feature_puid_layer_loaded ? (
                  <RemoveFromMap style={{ margin: "1px" }} />
                ) : (
                  <AddToMap style={{ margin: "1px" }} />
                )
              }
              onClick={this.toggleFeaturePUIDLayer.bind(
                this,
                this.state.currentFeature
              )}
              disabled={
                !(
                  this.state.currentFeature.preprocessed &&
                  this.state.currentFeature.occurs_in_planning_grid
                )
              }
            >
              {this.state.currentFeature.feature_puid_layer_loaded
                ? "Remove planning unit outlines"
                : "Outline planning units where the feature occurs"}
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={<ZoomIn style={{ margin: "1px" }} />}
              style={{
                display: this.state.currentFeature.extent ? "block" : "none",
              }}
              onClick={this.zoomToFeature.bind(this, this.state.currentFeature)}
            >
              Zoom to feature extent
            </MenuItemWithButton>
            <MenuItemWithButton
              leftIcon={<Preprocess style={{ margin: "1px" }} />}
              style={{
                display:
                  this.state.currentFeature.old_version ||
                  this.state.userData.ROLE === "ReadOnly"
                    ? "none"
                    : "block",
              }}
              onClick={this.preprocessSingleFeature.bind(
                this,
                this.state.currentFeature
              )}
              disabled={
                this.state.currentFeature.preprocessed ||
                this.state.preprocessing
              }
            >
              Pre-process
            </MenuItemWithButton>
          </Menu>
        </Popover>
        <TargetDialog
          open={this.state.targetDialogOpen}
          onOk={this.closeTargetDialog.bind(this)}
          showCancelButton={true}
          onCancel={this.closeTargetDialog.bind(this)}
          updateTargetValueForFeatures={this.updateTargetValueForFeatures.bind(
            this
          )}
        />
        <GapAnalysisDialog
          open={this.state.gapAnalysisDialogOpen}
          showCancelButton={true}
          onOk={this.closeGapAnalysisDialog.bind(this)}
          onCancel={this.closeGapAnalysisDialog.bind(this)}
          closeGapAnalysisDialog={this.closeGapAnalysisDialog.bind(this)}
          gapAnalysis={this.state.gapAnalysis}
          preprocessing={this.state.preprocessing}
          projectFeatures={this.state.projectFeatures}
          metadata={this.state.metadata}
          marxanServer={this.state.marxanServer}
          reportUnits={this.state.userData.REPORTUNITS}
        />
        <ShareableLinkDialog
          open={this.state.shareableLinkDialogOpen}
          onOk={() => this.updateState({ shareableLinkDialogOpen: false })}
          shareableLinkUrl={
            window.location +
            "?server=" +
            this.state.marxanServer.name +
            "&user=" +
            this.state.user +
            "&project=" +
            this.state.project
          }
        />
        <AtlasLayersDialog
          open={this.state.atlasLayersDialogOpen}
          onOk={this.closeAtlasLayersDialog.bind(this)}
          onCancel={this.clearSelactedLayers.bind(this)}
          loading={this.state.loading}
          atlasLayers={this.state.atlasLayers}
          marxanServer={this.state.marxanServer}
          setSnackBar={this.setSnackBar.bind(this)}
          selectedLayers={this.state.selectedLayers}
          setselectedLayers={this.setselectedLayers.bind(this)}
        />
        <CumulativeImpactDialog
          loading={this.state.loading || this.state.uploading}
          open={this.state.cumulativeImpactDialogOpen}
          onOk={() => this.updateState({ cumulativeImpactDialogOpen: false })}
          onCancel={() =>
            this.updateState({ cumulativeImpactDialogOpen: false })
          }
          openHumanActivitiesDialog={this.openHumanActivitiesDialog.bind(this)}
          metadata={this.state.metadata}
          allImpacts={this.state.allImpacts}
          clickImpact={this.clickImpact.bind(this)}
          initialiseDigitising={this.initialiseDigitising.bind(this)}
          updateState={this.updateState.bind(this)}
          selectedImpactIds={this.state.selectedImpactIds}
          openImportedActivitesDialog={this.openImportedActivitesDialog.bind(
            this
          )}
          setSnackBar={this.setSnackBar.bind(this)}
          userRole={this.state.userData.ROLE}
        />
        <HumanActivitiesDialog
          loading={this.state.loading || this.state.uploading}
          open={this.state.humanActivitiesDialogOpen}
          onOk={() => this.updateState({ humanActivitiesDialogOpen: false })}
          onCancel={() =>
            this.updateState({ humanActivitiesDialogOpen: false })
          }
          updateState={this.updateState.bind(this)}
          metadata={this.state.metadata}
          activities={this.state.activities}
          initialiseDigitising={this.initialiseDigitising.bind(this)}
          setSnackBar={this.setSnackBar.bind(this)}
          userRole={this.state.userData.ROLE}
          fileUpload={this.uploadRaster.bind(this)}
          saveActivityToDb={this.saveActivityToDb.bind(this)}
          openImportedActivitesDialog={this.openImportedActivitesDialog.bind(
            this
          )}
        />
        <RunCumuluativeImpactDialog
          loading={this.state.loading || this.state.uploading}
          open={this.state.importedActivitiesDialogOpen}
          onOk={() => this.updateState({ importedActivitiesDialogOpen: false })}
          onCancel={() =>
            this.updateState({ importedActivitiesDialogOpen: false })
          }
          updateState={this.updateState.bind(this)}
          metadata={this.state.metadata}
          uploadedActivities={this.state.uploadedActivities}
          setSnackBar={this.setSnackBar.bind(this)}
          userRole={this.state.userData.ROLE}
          runCumulativeImpact={this.runCumulativeImpact.bind(this)}
        />
        <MenuBar
          open={this.state.loggedIn}
          user={this.state.user}
          userRole={this.state.userData.ROLE}
          infoPanelOpen={this.state.infoPanelOpen}
          resultsPanelOpen={this.state.resultsPanelOpen}
          toggleInfoPanel={this.toggleInfoPanel.bind(this)}
          toggleResultsPanel={this.toggleResultsPanel.bind(this)}
          showToolsMenu={this.showToolsMenu.bind(this)}
          showUserMenu={this.showUserMenu.bind(this)}
          showHelpMenu={this.showHelpMenu.bind(this)}
          marxanServer={this.state.marxanServer.name}
          openProjectsDialog={this.openProjectsDialog.bind(this)}
          openServerDetailsDialog={this.openServerDetailsDialog.bind(this)}
          openActivitiesDialog={this.openActivitiesDialog.bind(this)}
          openFeaturesDialog={this.openFeaturesDialog.bind(this)}
          openPlanningGridsDialog={this.openPlanningGridsDialog.bind(this)}
          openCumulativeImpactDialog={this.openCumulativeImpactDialog.bind(
            this
          )}
          openAtlasLayersDialog={this.openAtlasLayersDialog.bind(this)}
        />
      </React.Fragment>
      // </ThemeProvider>
    );
  }
}

export default App;

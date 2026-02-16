import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { CONSTANTS, INITIAL_VARS } from "./bpVars";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  addFeaturesToCache,
  setAllFeaturesInCache,
  setOneFeatureInCache,
} from "./store/featureCacheActions";
import {
  addToImportLog,
  clearImportLog,
  removeImportLogMessage,
  setActiveTab,
  setBasemap,
  setLoading,
  setOwner,
  setRegistry,
  setUploadedActivities,
  toggleDialog,
} from "@slices/uiSlice";
import { getPaintProperty, getTypeProperty } from "@features/featuresService";
import {
  initialiseServers,
  projectApiSlice,
  selectServer,
  setActiveProjectId,
  setCostData,
  setPlanningCostsTrigger,
  setProjectCosts,
  setProjectImpacts,
  setProjectList,
  setProjectListDialogHeading,
  setProjectListDialogTitle,
  setProjects,
  toggleProjDialog,
  useGetProjectQuery,
  useRenameProjectMutation,
} from "@slices/projectSlice";
import {
  logOut,
  selectCurrentToken,
  selectCurrentUser,
  selectCurrentUserId,
  selectIsUserLoggedIn,
} from "@slices/authSlice";
import {
  setDigitisedFeatures,
  setFeaturePlanningUnits,
  setSelectedFeatureId,
  setSelectedFeatureIds,
  toggleFeatureD,
  useGetAllFeaturesQuery,
  useListFeaturePUsQuery,
} from "@slices/featureSlice";
import {
  setIdentifyPlanningUnits,
  togglePUD,
  useDeletePlanningUnitGridMutation,
  useExportPlanningUnitGridQuery,
  useListPlanningUnitGridsQuery,
} from "@slices/planningUnitSlice";
import {
  setUsers,
  useCreateUserMutation,
  useDeleteUserMutation,
  useLogoutUserMutation,
  useUpdateUserMutation,
} from "@slices/userSlice";
// SERVICES
import { useDispatch, useSelector } from "react-redux";

import AboutDialog from "./AboutDialog";
import AlertDialog from "./AlertDialog";
import AtlasLayersDialog from "./AtlasLayersDialog";
import ChangPasswordDialog from "./User/ChangePasswordDialog";
import ClassificationDialog from "./ClassificationDialog";
import CostsDialog from "./CostsDialog";
import CumulativeImpactDialog from "./Impacts/CumulativeImpactDialog";
import FeatureDialog from "@features/FeatureDialog";
import FeatureInfoDialog from "@features/FeatureInfoDialog";
import FeatureMenu from "@features/FeatureMenu";
import FeaturesDialog from "@features/FeaturesDialog";
import HelpMenu from "./HelpMenu";
import HexInfoDialog from "./HexInfo/HexInfoDialog";
import HomeButton from "./HomeButton";
import HumanActivitiesDialog from "./Impacts/HumanActivitiesDialog";
import ImportCostsDialog from "./ImportComponents/ImportCostsDialog";
import ImportFeaturesDialog from "@features/ImportFeaturesDialog";
import ImportPlanningGridDialog from "@planningGrids/ImportPlanningGridDialog";
import InfoPanel from "./LeftInfoPanel/InfoPanel";
import Loading from "./Loading";
import LoginDialog from "./LoginDialog";
//mapbox imports
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MenuBar from "./MenuBar/MenuBar";
//project components
import NewFeatureDialog from "@features/NewFeatureDialog";
import NewPlanningGridDialog from "@planningGrids/NewPlanningGridDialog";
import NewProjectDialog from "@projects/NewProjectDialog";
import PlanningGridDialog from "@planningGrids/PlanningGridDialog";
import PlanningGridsDialog from "@planningGrids/PlanningGridsDialog";
import ProfileDialog from "./User/ProfileDialog";
import ProjectsDialog from "@projects/ProjectsDialog";
import ProjectsListDialog from "@projects/ProjectsListDialog";
import ResendPasswordDialog from "./User/ResendPasswordDialog";
import ResetDialog from "./ResetDialog";
import ResultsPanel from "./RightInfoPanel/ResultsPanel";
import RunCumuluativeImpactDialog from "./Impacts/RunCumuluativeImpactDialog";
import RunSettingsDialog from "./RunSettingsDialog";
import ServerDetailsDialog from "./User/ServerDetails/ServerDetailsDialog";
import TargetDialog from "./TargetDialog";
import ToolsMenu from "./ToolsMenu";
import UserMenu from "./User/UserMenu";
import UserSettingsDialog from "./User/UserSettingsDialog";
import UsersDialog from "./User/UsersDialog";
//@mui/material components and icons
import { addFeatureAttributes } from "@features/featureUtils";
import classyBrew from "classybrew";
import { featureApiSlice } from "@slices/featureSlice";
/*global fetch*/
/*global URLSearchParams*/
/*global AbortController*/
import { getTilesBaseUrl } from "@config/api";
/*eslint-enable no-unused-vars*/
// import { ThemeProvider } from "@mui/material/styles";
import jsonp from "jsonp-promise";
import mapboxgl from "mapbox-gl";
import packageJson from "../package.json";
// wherever loadProjectAndSetup lives
import store from "@store/store";
import { switchProject } from "./slices/projectSlice";
/*eslint-disable no-unused-vars*/
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useGetPrioritizrRunResultsQuery } from "@slices/prioritizrApiSlice";
import { useSnackbar } from "notistack";
import useWebSocketHandler from "./WebSocketHandler";
import { zoomToBounds } from "./Helpers";

import.meta.env.VITE_MAPBOX_TOKEN;

//GLOBAL VARIABLES
let MARXAN_CLIENT_VERSION = packageJson.version;
let timers = []; //array of timers for seeing when asynchronous calls have finished
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

const App = () => {
  const dispatch = useDispatch();

  ////////////////////////////////////////////////////////////////////////
  /////////// RTKQ data                       ////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  const userId = useSelector(selectCurrentUserId);
  const isLoggedIn = useSelector(selectIsUserLoggedIn);

  const userData = useSelector(selectCurrentUser);
  const [updateUser] = useUpdateUserMutation();
  // Instead of importing the whole state - import whats needed
  const projState = useSelector((state) => state.project);
  const bioprotectServers = useSelector((state) => state.project.bpServers);
  const bioprotectServer = useSelector((state) => state.project.bpServer);
  const projDialogStates = useSelector((state) => state.project.dialogs);

  const owner = useSelector((state) => state.ui.owner);
  const uiState = useSelector((state) => state.ui);
  const userState = useSelector((state) => state.user);
  const puState = useSelector((state) => state.planningUnit);
  const featureState = useSelector((state) => state.feature);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const token = useSelector(selectCurrentToken);

  // PROJECT QUERY
  const activeProjectId = useSelector((state) => state.project.activeProjectId);

  const {
    data: projectResp,
    isFetching,
    refetch: refetchProject,
  } = useGetProjectQuery(activeProjectId, {
    skip: !isLoggedIn || activeProjectId == null,
  });

  const project = projectResp?.project;
  const renderer = projectResp?.renderer;
  const projectFeatures = projectResp?.features ?? [];
  const planningUnits = projectResp?.planning_units;
  const metadata = projectResp?.metadata ?? {};
  const costNames = projectResp?.costnames ?? [];
  const [renameProjectMutation] = useRenameProjectMutation();

  // Refs for Map so state isnt stale.
  const featuresRef = useRef(projectFeatures);
  const planningUnitsRef = useRef(planningUnits);
  const ownerRef = useRef(owner);
  const projectIdRef = useRef(activeProjectId);
  const projFeaturesRef = useRef(projectFeatures);
  const bioprotectServerRef = useRef(null);

  useEffect(() => {
    bioprotectServerRef.current = bioprotectServer;
  }, [bioprotectServer]);
  useEffect(() => {
    ownerRef.current = owner;
  }, [owner]);
  useEffect(() => {
    projectIdRef.current = activeProjectId;
  }, [activeProjectId]);
  useEffect(() => {
    planningUnitsRef.current = planningUnits;
  }, [planningUnits]);
  useEffect(() => {
    projFeaturesRef.current = projectFeatures;
  }, [projectFeatures]);

  const { refetch: refetchPlanningUnitGrids } = useListPlanningUnitGridsQuery();
  const [logoutUser] = useLogoutUserMutation();

  // PLANNING UNITS QUERY
  const selectedFeatureId = featureState.selectedFeatureId;
  const { data: featurePUData, isLoading } = useListFeaturePUsQuery(
    {
      owner: uiState.owner,
      project: project,
      featureId: selectedFeatureId,
    },
    { skip: !uiState.owner || !project || selectedFeatureId === null },
  );

  // ALL FEATURES QUERY
  const {
    data: allFeaturesResp,
    isFetching: isFetchingAllFeatures,
    refetch: refetchAllFeatures,
  } = useGetAllFeaturesQuery(undefined, {
    skip: !isLoggedIn,
  });
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? [];
  const [triggerListFeaturePUs] = featureApiSlice.useLazyListFeaturePUsQuery();

  const [puEditing, setPuEditing] = useState(false);
  const puEditingRef = useRef(puEditing);
  useEffect(() => {
    puEditingRef.current = puEditing;
  }, [puEditing]);

  // RESULTS QUERY
  const selectedRunId = useSelector((s) => s.prioritizr.selectedRunId);
  const { data: runResultsResp } = useGetPrioritizrRunResultsQuery(
    selectedRunId,
    { skip: !selectedRunId },
  );
  const runResults = runResultsResp?.data ?? [];

  useEffect(() => {
    if (!map.current) return;
    if (!puLayerIdsRef.current?.resultsLayerId) return;

    // If no run selected, clear results layer
    if (!selectedRunId) {
      renderPuPrioritizrLayer([]);
      return;
    }

    // Render whenever the API response changes
    renderPuPrioritizrLayer(runResults);
  }, [selectedRunId, runResults]);

  const [brew, setBrew] = useState(null);
  const [dataBreaks, setDataBreaks] = useState([]);
  const [mapboxDrawControls, setMapboxDrawControls] = useState(undefined);
  const [pid, setPid] = useState("");
  const [allImpacts, setAllImpacts] = useState([]);
  const [atlasLayers, setAtlasLayers] = useState([]);
  const [costsLoading, setCostsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [files, setFiles] = useState({});
  /////////////////////////////////////////////////////////////////////////////
  const [logMessages, setLogMessages] = useState([]);
  const [mapPaintProperties, setMapPaintProperties] = useState({
    mapPP0: [],
    mapPP1: [],
    mapPP2: [],
    mapPP3: [],
    mapPP4: [],
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [preprocessing, setPreprocessing] = useState(false);
  const [runLogs, setRunLogs] = useState([]);
  const [runParams, setRunParams] = useState([]);
  const [selectedCosts, setSelectedCosts] = useState([]);
  const [selectedImpactIds, setSelectedImpactIds] = useState([]);
  const [smallLinearGauge, setSmallLinearGauge] = useState(true);
  const [tileset, setTileset] = useState(null);
  const [unauthorisedMethods, setUnauthorisedMethods] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState([]);
  const [wdpaAttribution, setWdpaAttribution] = useState("");
  const [popupPoint, setPopupPoint] = useState({ x: 0, y: 0 });
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const [wdpaLayer, setWdpaLayer] = useState();
  const [resultsLayer, setResultsLayer] = useState({});
  const [summaryStats, setSummaryStats] = useState([]);
  const [paLayerVisible, setPaLayerVisible] = useState(false);
  const [planningGridMetadata, setPlanningGridMetadata] = useState({});
  const [runlogTimer, setRunlogTimer] = useState(0);
  const [addToProject, setAddToProject] = useState(false);
  const tilesUrl = getTilesBaseUrl();
  const mapContainer = useRef(null);
  const map = useRef(import.meta.hot ? window._mapInstance : null);
  const puLayerIdsRef = useRef({
    sourceId: null,
    resultsLayerId: null,
    costsLayerId: null,
    puLayerId: null,
    statusLayerId: null,
    sourceLayerName: null,
    propId: "h3_index",
  });
  const visibleLayersRef = useRef([]);

  const { showMessage } = useAppSnackbar();
  const { enqueueSnackbar } = useSnackbar();
  // store handler references for cleanup
  const onClickRef = useRef(null);
  const onContextMenuRef = useRef(null);

  // Initialize map once after mount (prevents container=null errors)
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      console.log("🗺️ Creating initial Mapbox map...");
      createMap(); // no style argument = default
    }
  }, [mapContainer.current]);

  useEffect(() => {
    if (featurePUData) {
      dispatch(setFeaturePlanningUnits(featurePUData) || []);
    }
  }, [dispatch, featurePUData]);

  useEffect(() => {
    dispatch(initialiseServers(INITIAL_VARS.BP_SERVERS))
      .unwrap()
      .then((message) => console.log(message))
      .catch((error) => console.error("Error:", error));
  }, [dispatch, INITIAL_VARS.BP_SERVERS]);

  const selectServerByName = useCallback(
    (servername) => {
      // Remove the search part of the URL
      window.history.replaceState({}, document.title, "/");
      const server = bioprotectServers.find((item) => item.name === servername);
      if (server) {
        dispatch(selectServer(server));
      }
    },
    [dispatch, bioprotectServers],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fetchGlobalVariables = async () => {
      console.log("fetchGlobalVariables.... ");
      dispatch(setLoading(true));
      try {
        setBrew(new classyBrew());
        dispatch(setRegistry(INITIAL_VARS));
        if (searchParams.has("server")) {
          selectServerByName(searchParams.get("server"));
        }
      } catch (error) {
        console.error("Error fetching global variables:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchGlobalVariables();
  }, [dispatch]);

  useEffect(() => {
    if (
      projState.planningCostsTrigger &&
      uiState.owner !== "" &&
      userId !== ""
    ) {
      (async () => {
        await getPuCostsLayer();
        dispatch(setPlanningCostsTrigger(false));
      })();
    }
  }, [projState.planningCostsTrigger, uiState.owner, userId]);

  useEffect(() => {
    return () => {
      // remove listeners if they were still attached
      if (onClickRef.current) {
        map.current?.off("click", CONSTANTS.PU_LAYER_NAME, onClickRef.current);
        onClickRef.current = null;
      }
      if (onContextMenuRef.current) {
        map.current?.off(
          "contextmenu",
          CONSTANTS.PU_LAYER_NAME,
          onContextMenuRef.current,
        );
        onContextMenuRef.current = null;
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (!map.current) return;
    if (!puLayerIdsRef.current?.sourceId) return;
    if (!planningUnits || Object.keys(planningUnits).length === 0) return;
    const { sourceId, sourceLayerName } = puLayerIdsRef.current;
    for (const [status, ids] of Object.entries(planningUnits)) {
      ids.forEach((id) => {
        map.current.setFeatureState(
          { source: sourceId, sourceLayer: sourceLayerName, id: String(id) },
          { status: Number(status) },
        );
      });
    }
    map.current.triggerRepaint();
  }, [planningUnits, puLayerIdsRef.current?.sourceId, map.current]);

  const setSnackBar = (message, silent = false) => {
    if (!silent) {
      showMessage(message, "info");
    }
  };

  // Memoized function to check for timeout errors or empty responses
  const responseIsTimeoutOrEmpty = useCallback(
    (response, snackbarOpen = true) => {
      if (!response) {
        const msg = "No response received from server";
        if (snackbarOpen) {
          showMessage(msg, "info");
        }
        return true;
      }
      return false;
    },
    [],
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
        const err = response.error || response.metadata.error;
        if (snackbarOpen) {
          setSnackBar(err);
        }
        return true;
      } else if (response && response.warning && snackbarOpen) {
        // Handle warnings from server responses
        setSnackBar(response.warning);
      }
      return false;
    },
    [setSnackBar],
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
        dispatch(addToImportLog("Error message from server: " + error));
      }
      return isError;
    },
    [responseIsTimeoutOrEmpty, isServerError],
  );

  //updates the allFeatures to set the various properties based on which features have been selected in the FeaturesDialog or programmatically
  const updateSelectedFeatures = async () => {
    // Get the updated features
    const prevAll = allFeatures;
    const prevProj = projectFeatures;

    let updatedFeatures = allFeatures.map((feature) => {
      if (featureState.selectedFeatureIds.includes(feature.id)) {
        return { ...feature, selected: true };
      } else {
        if (feature.feature_layer_loaded) {
          toggleFeatureLayer(feature);
        }
        if (feature.feature_puid_layer_loaded) {
          toggleFeaturePUIDLayer(feature);
        } // Feature is not selected
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
    const selected = updatedFeatures.filter((item) => item.selected);

    // update all features
    const patchAllResult = dispatch(
      setAllFeaturesInCache({ features: updatedFeatures }),
    );

    // update project features
    const patchProjectResult = dispatch(
      projectApiSlice.util.updateQueryData(
        "getProject",
        activeProjectId,
        (draft) => {
          draft.features = selected;
        },
      ),
    );

    // Persist changes to the server if the user is not read-only
    try {
      if (userData?.role !== "ReadOnly") {
        await updateProjectFeatures(selected);
      }
    } catch (err) {
      patchAllResult?.undo?.();
      patchProjectResult?.undo?.();
      showMessage?.(`Failed to save selections. Reverted. ${err}`, "error");
    } finally {
      dispatch(
        toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }),
      );
      dispatch(
        toggleFeatureD({ dialogName: "newFeaturePopoverOpen", isOpen: false }),
      );
      dispatch(
        toggleFeatureD({
          dialogName: "importFeaturePopoverOpen",
          isOpen: false,
        }),
      );
    }
  };

  const newFeatureCreated = useCallback(
    async (id) => {
      try {
        const result = await dispatch(
          featureApi.endpoints.getFeature.initiate(id),
        ).unwrap();

        const featureData = result.data?.data?.[0];
        if (!featureData) return;

        const updatedFeature = addFeatureAttributes(featureData);
        dispatch(addFeaturesToCache({ features: [updatedFeature] }));

        // update server
        dispatch(
          featureApiSlice.util.invalidateTags([
            { type: "Features", id: "LIST" },
          ]),
        );

        if (addToProject) {
          dispatch(addFeature(updatedFeature));
          await updateSelectedFeatures();
        }
      } catch (err) {
        console.error("Failed to load feature:", err);
      }
    },
    [dispatch, addFeaturesToCache, addToProject, updateSelectedFeatures],
  );

  // ---------------------------------------- //
  // ---------------------------------------- //
  // ---------------------------------------- //
  // ---------------------------------------- //
  // REQUEST HELPERS
  // ---------------------------------------- //
  // ---------------------------------------- //
  // ---------------------------------------- //
  // ---------------------------------------- //
  const _get = useCallback(
    async (path, { timeout = CONSTANTS.TIMEOUT } = {}) => {
      const server = bioprotectServerRef.current;

      if (!server?.endpoint) {
        console.warn("GET skipped: no active server", server);
        return null;
      }

      const url = new URL(path, server.endpoint).toString();
      console.log("url ", url);
      dispatch(setLoading(true));

      try {
        const { promise } = jsonp(url, { timeout });
        const response = await promise;
        console.log("response ", response);

        if (checkForErrors(response)) {
          // If your checkForErrors returns truthy, throw the error it found
          throw response?.error || new Error("Request failed");
        }

        return response; // or `return response.data;` if you always want data
      } catch (err) {
        console.error("GET failed:", err);
        showMessage("Request timeout", "error");
        throw err; // keep promise rejection behavior
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, checkForErrors, showMessage],
  );

  //makes a POST request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  const _post = useCallback(
    async (
      endpointPath,
      formData,
      timeout = CONSTANTS.TIMEOUT,
      withCredentials = CONSTANTS.SEND_CREDENTIALS,
    ) => {
      dispatch(setLoading(true));
      try {
        const controller = new AbortController();
        const { signal } = controller;
        let timeoutId = null;
        // Set a timeout to abort the request if it takes too long
        if (timeout > 0) {
          timeoutId = setTimeout(() => controller.abort(), timeout);
        }

        const response = await fetch(bioprotectServer.endpoint + endpointPath, {
          method: "POST",
          body: formData,
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
        if (err.name !== "AbortError" && err.message !== "Network Error") {
          setSnackBar(err.message);
        }
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [bioprotectServer.endpoint, checkForErrors, setSnackBar],
  );

  const startLogging = (clearLog = false) => {
    //switches the results pane to the log tab and clears log if needs be
    dispatch(setActiveTab("log"));
    if (clearLog) {
      dispatch(clearImportLog());
    }
  };

  // Main logging method - all log messages use this method
  const messageLogger = useCallback(
    (message) => {
      const timestampedMessage = {
        ...message,
        timestamp: new Date().toLocaleTimeString(),
      };
      dispatch(addToImportLog(timestampedMessage));
    },
    [dispatch],
  );

  // removes a message from the log by matching on pid and status or just status
  // update the messages state - filter previous messages state by pid and status
  const removeMessageFromLog = useCallback(
    (status, pid) => {
      const matchText = status;
      dispatch(removeImportLogMessage(matchText));
    },
    [dispatch],
  );

  //logs the message if necessary - this removes duplicates
  const logMessage = useCallback(
    (message) => {
      if (!message || typeof message.status !== "string") return;

      const timestampedMessage = {
        ...message,
        time: new Date().toLocaleTimeString(),
      };

      const handleSocketClosedUnexpectedly = () => {
        dispatch(
          addToImportLog({
            method: message.method,
            status: "Finished",
            error: "The WebSocket connection closed unexpectedly",
            time: timestampedMessage.time,
          }),
        );
        dispatch(removeImportLogMessage("Preprocessing"));
        setPid(0);
      };

      const handlePidMessage = () => {
        const existingMessages = uiState.importLog.filter(
          (_message) => _message.pid === message.pid,
        );
        const latestStatus = existingMessages.at(-1)?.status;

        if (!existingMessages.length || message.status !== latestStatus) {
          if (message.status === "Finished") {
            dispatch(removeImportLogMessage("RunningQuery"));
          }
          dispatch(addToImportLog(timestampedMessage));
        }
      };
      const handleGeneralMessage = () => {
        const allowDuplicates = ["RunningMarxan", "Started", "Finished"];
        if (!allowDuplicates.includes(message.status)) {
          dispatch(removeImportLogMessage(message.status));
        }
        dispatch(addToImportLog(timestampedMessage));
      };

      if (message.status === "SocketClosedUnexpectedly") {
        handleSocketClosedUnexpectedly();
      } else if ("pid" in message) {
        handlePidMessage();
      } else {
        handleGeneralMessage();
      }
    },
    [dispatch, uiState.importLog],
  );

  const startWebSocket = useWebSocketHandler(
    checkForErrors,
    logMessage,
    setPreprocessing,
    setPid,
    newFeatureCreated,
    removeMessageFromLog,
  );

  const handleWebSocket = async (url) => {
    try {
      const message = await startWebSocket(url);
      console.log("WebSocket finished successfully:", message);
      return message;
    } catch (err) {
      console.error("WebSocket failed:", err);
      return { error: `Websocket error occured ${err.reason}  - ${err}` };
    }
  };
  // ------------------------------------------------------------------- //
  // ------------------------------------------------------------------- //
  // ------------------------------------------------------------------- //
  // ------------------------------------------------------------------- //
  // MANAGING USERS
  // ------------------------------------------------------------------- //
  // ------------------------------------------------------------------- //
  // ------------------------------------------------------------------- //
  // ------------------------------------------------------------------- //

  const removeKeys = (obj, keys) => {
    // Create a shallow copy of the object to avoid mutating the original
    const newObj = { ...obj };
    // Iterate over the keys and delete each key from the new object
    keys.forEach((key) => delete newObj[key]);
    return newObj;
  };

  //deletes all of the projects belonging to the passed user from the state
  const deleteProjectsForUser = (user) => {
    const updatedProjects = projState.projects.filter(
      (project) => project.user !== user,
    );
    dispatch(setProjects(updatedProjects));
  };

  const createNewUser = async (user, password, name, email) => {
    const [createUser] = useCreateUserMutation();
    const formData = new FormData();
    formData.append("user", user);
    formData.append("password", password);
    formData.append("fullname", name);
    formData.append("email", email);

    try {
      const response = createUser(formData);
      // UI feedback
      setSnackBar(response.info);
      dispatch(
        toggleDialog({ dialogName: "registerDialogOpen", isOpen: false }),
      );
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async (parameters, user = userState.user) => {
    try {
      // Remove keys that are not part of the user's information
      const filteredParameters = removeKeys(parameters, [
        "updated",
        "validEmail",
      ]);
      if (!!!user) {
        user = userData;
      }
      const formData = new FormData();
      formData.append("id", userId);
      formData.append("user", userData.name);
      appendToFormData(formData, filteredParameters);

      await updateUser(formData);
      // If successful, update the state if the current user is being updated
      if (user === userState.user) {
        // Update local user data
        const newUserData = { ...userData, ...filteredParameters };
        // Update state
        // this needs to be changed to credentials or something.
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        ///////////////////////// TDODO
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        // setUserData(newUserData);
        return newUserData; // Optionally return response if needed elsewhere
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error; // Optional: rethrow error if you want to handle it further up the call stack
    }
  };

  const deleteUser = async (user) => {
    const [deleteUser, { isLoading, isSuccess, isError, error }] =
      useDeleteUserMutation();
    try {
      // Send request to delete the user
      await deleteUser(user).unwrap();
      showMessage("User Deleted", "success");
      // Update local state to remove the deleted user
      const usersCopy = userState.users.filter((item) => item.user !== user);
      dispatch(setUsers(usersCopy));
      // Check if the current project belongs to the deleted user
      if (uiState.owner === user) {
        showMessage(
          "Current project no longer exists. Loading next available.",
          "success",
        );
        // Load the next available project
        const nextProject = projState.projects.find(
          (project) => project.user !== user,
        );
        if (nextProject) {
          await dispatch(switchProject(nextProject.id)).unwrap();
        }
        deleteProjectsForUser(user);
      }
    } catch (error) {
      showMessage("Failed to delete user: ", "error");
    }
  };

  const handleCreateUser = async (user, password, name, email) =>
    await createNewUser(user, password, name, email);

  const handleDeleteUser = async (user) => await deleteUser(user);

  const loadProjectAndSetup = async (projectId) => {
    try {
      await dispatch(switchProject(projectId)).unwrap();

      const projectData = await dispatch(
        projectApiSlice.endpoints.getProject.initiate(projectId, {
          forceRefetch: true,
        }),
      ).unwrap();

      await postLoginSetup(projectData);
      return projectData;
    } catch (error) {
      console.error("Failed to load project:", error);
      showMessage("Error loading project", "error");
    }
  };

  //the user is validated so login
  const postLoginSetup = async (projectData) => {
    try {
      const currentBasemap = uiState.basemaps.find(
        (item) => item.name === uiState.basemap,
      );
      await loadBasemap(currentBasemap);

      const tilesetId = projectData.metadata.pu_tilesetid;
      if (tilesetId) {
        await changePlanningGrid(tilesetId);
        addPlanningGridLayers(tilesetId);

        if (projState.costData) renderPuCostLayer(projState.costData);
        // await getResults(projectData.user, projectData.project);
      }

      const { data: allFeaturesResponse } = await dispatch(
        featureApiSlice.endpoints.getAllFeatures.initiate(),
      );
      const allFeatures = allFeaturesResponse?.data || [];
      const activitiesData = await _get("getUploadedActivities");

      dispatch(setUploadedActivities(activitiesData.data));

      setPUTabInactive();
      dispatch(toggleDialog({ dialogName: "infoPanelOpen", isOpen: true }));
      dispatch(toggleDialog({ dialogName: "resultsPanelOpen", isOpen: true }));
      dispatch(setLoading(false));

      configureProjectFeatures(
        projectData.features,
        projectData.feature_preprocessing,
        allFeatures,
      );

      return "Logged in";
    } catch (error) {
      showMessage(`Login failed: ${error}`, "error");
      throw error;
    }
  };

  //log out and reset some state
  const handleLogOut = async () => {
    console.log("* * * Logging out... * * *");

    try {
      // Close all open dialogs
      dispatch(toggleDialog({ dialogName: "userMenuOpen", isOpen: false }));
      dispatch(toggleDialog({ dialogName: "resultsPanelOpen", isOpen: false }));
      dispatch(toggleDialog({ dialogName: "infoPanelOpen", isOpen: false }));

      // Reset local state
      setBrew(new classyBrew());
      setRunParams([]);
      setNotifications([]);
      setMetadata({});
      setFiles({});

      // Reset Redux slices
      dispatch(setOwner(""));
      dispatch(setUsers([]));
      dispatch(setProjects([]));
      dispatch(setActiveProjectId(null));
      dispatch(setSelectedFeatureIds([]));
      dispatch(setSelectedFeatureId(null));

      // Clear RTK Query cache
      dispatch(apiSlice.util.resetApiState());

      // Clear authentication data
      dispatch(logOut()); // from authSlice
      await logoutUser().unwrap();

      // Clear cookies manually if needed
      document.cookie
        .split(";")
        .forEach(
          (c) =>
            (document.cookie = c
              .replace(/^ +/, "")
              .replace(
                /=.*/,
                "=;expires=" + new Date().toUTCString() + ";path=/",
              )),
        );

      // 6Reset UI
      showMessage("Successfully logged out", "success");
    } catch (err) {
      console.error("Logout error:", err);
      showMessage("Logout failed", "error");
    }
  };

  const changeRole = async (user, role) => {
    await handleUpdateUser({ role: role }, user);
    const updatedUsers = userState.users.map((item) =>
      item.user === user ? { ...item, role: role } : item,
    );
    // Update the state with the modified user list
    dispatch(setUsers(updatedUsers));
  };

  const toggleProjectPrivacy = async (newValue) => {
    await updateProjectParameter("PRIVATE", newValue);
    await refetchProject();
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
    if (uiState.registry.NOTIFICATIONS.length > 0) {
      addNotifications(uiState.registry.NOTIFICATIONS);
    }
    //see if there is a new version of the marxan-client software
    if (MARXAN_CLIENT_VERSION !== uiState.registry.CLIENT_VERSION) {
      addNotifications([
        {
          id: "marxan_client_update_" + uiState.registry.CLIENT_VERSION,
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
    if (bioprotectServer.server_version !== uiState.registry.SERVER_VERSION) {
      addNotifications([
        {
          id: "marxan_server_update_" + uiState.registry.SERVER_VERSION,
          html:
            "A new version of marxan-server is available (" +
            uiState.registry.SERVER_VERSION +
            "). Go to Help | Server Details for more information.",
          type: "Software Update",
          showForRoles: ["Admin"],
        },
      ]);
    }
    //check that there is enough disk space
    if (bioprotectServer.disk_space < 1000) {
      addNotifications([
        {
          id: "hardware_1000",
          html: "Disk space < 1Gb",
          type: "Hardware Issue",
          showForRoles: ["Admin"],
        },
      ]);
    } else if (bioprotectServer.disk_space < 2000) {
      addNotifications([
        {
          id: "hardware_2000",
          html: "Disk space < 2Gb",
          type: "Hardware Issue",
          showForRoles: ["Admin"],
        },
      ]);
    } else if (bioprotectServer.disk_space < 3000) {
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
      // const allowedForRole = item.showForRoles.includes(userData?.role);
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

  const appendToFormData = (formData, obj) => {
    // Iterate through the object and add each key/value pair to the FormData
    Object.entries(obj).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  };

  // saveOptions - Options are in users data - use updateUser to update them
  const saveOptions = async (options) => await handleUpdateUser(options);

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // PROJECTS
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  //updates the proj parameters back to the server (i.e. the input.dat file)
  const updateProjectParams = async (proj, parameters) => {
    //initialise the form data
    let formData = new FormData();
    formData.append("user", uiState.owner);
    formData.append("proj", proj);
    appendToFormData(formData, parameters);
    //post to the server and return a promise
    // return await _post("updateProjectParameters", formData); - old
    // # POST /projects?action=update
    // # Body:
    // # {
    // #     "user": "username",
    // #     "project": "project_name",
    // #     "param1": "value1",
    // #     "param2": "value2"
    // # }
    return await _post("projects?action=update", formData);
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

  //initialises the interest features based on the currently loading project
  const configureProjectFeatures = (
    projectFeatures,
    preprocessingData,
    allFeatures,
  ) => {
    const projectFeatureMap = Object.fromEntries(
      projectFeatures.map((f) => [f.feature_unique_id, f]),
    );

    // preprocessing rows are [project_id, feature_id, area, count]
    const preprocessMap = Object.fromEntries(
      (preprocessingData || []).map(([projectId, featureId, area, count]) => [
        featureId,
        { pu_area: area, pu_count: count },
      ]),
    );

    const processedFeatures = allFeatures.map((feature) => {
      const base = addFeatureAttributes(feature);
      const proj = projectFeatureMap[feature.id];
      const pre = preprocessMap[feature.id];
      const updated = { ...base };
      // override with preprocessing if available
      if (pre) {
        updated.preprocessed = true;
        updated.pu_area = pre.pu_area;
        updated.pu_count = pre.pu_count;
        updated.occurs_in_planning_grid = pre.pu_count > 0;
      }

      // override with project feature settings if selected
      if (proj) {
        updated.selected = true;
        updated.spf = proj.spf ?? base.spf;
        updated.target_value = proj.target_value ?? base.target_value;
      }
      return updated;
    });

    const selected = processedFeatures.filter((f) => f.selected);
    console.log("selected ", selected);

    // update RTKQ cache instead of redux
    dispatch(setAllFeaturesInCache({ features: processedFeatures }));
    dispatch(setSelectedFeatureIds(selected.map((f) => f.id)));
    return;
  };

  const getProjectList = async (obj, _type) => {
    try {
      let projects = await getProjectsForPlanningGrid(obj.feature_class_name);
      showProjectListDialog(
        projects,
        "Projects list",
        "The feature is used in the following projects:",
      );
    } catch (error) {
      console.error("Error fetching project list:", error);
      // Optionally: handle the error (e.g., show a user-friendly message)
    }
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
      proj.features.map((item) => item.id).join(","),
    );
    formData.append("target_values", proj.features.map(() => 17).join(","));
    formData.append("spf_values", proj.features.map(() => 40).join(","));

    return formData;
  };

  //REST call to delete a specific project
  const deleteProject = async (user, proj, silent = false) => {
    try {
      // Make the request to delete the project
      // const response = await _get(`deleteProject?user=${user}&project=${proj}`); - old
      const response = await _get(
        `projects?action=delete&user=${user}&project=${proj}`,
      );

      // Fetch the updated list of projects
      await getProjects();

      // Show a snackbar message, but allow it to be silent if specified
      showMessage(response.info, "info", silent);

      // Check if the deleted project is the current one
      if (response.project === project) {
        showMessage(
          "Current project deleted - loading first available",
          "success",
        );
        const nextProject = projState.projects.find((p) => p.name !== project);
        if (nextProject) {
          await dispatch(switchProject(nextProject.id)).unwrap();
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showMessage("Error deleting project:", "error");
    }
  };

  //exports the project on the server and returns the *.mxw file
  const exportProject = async (user, proj) => {
    try {
      dispatch(setActiveTab("log"));
      const message = await handleWebSocket(
        `exportProject?user=${user}project=${proj}`,
      );
      return bioprotectServer.endpoint + "exports/" + message.filename;
    } catch (error) {
      console.log(error);
    }
  };

  const cloneProject = async (user, proj) => {
    // const response = await _get(`cloneProject?user=${user}&project=${proj}`); - old
    const response = await _get(
      `projects?action=clone&user=${user}&project=${proj}`,
    );
    getProjects();
    showMessage(response.info, "success");
  };

  //rename a specific project on the server
  const renameProject = async (newName) => {
    if (!newName || newName === project) return;

    try {
      await renameProjectMutation({
        projectId: activeProjectId,
        newName,
      }).unwrap();

      showMessage("Project renamed", "success");
    } catch (err) {
      showMessage(err?.data?.error || "Rename failed", "error");
    }
  };

  const renameDescription = async (newDesc) => {
    await updateProjectParameter("DESCRIPTION", newDesc);
    await refetchProject(); // or invalidateTags
    return "Description Renamed";
  };

  const getProjects = async () => {
    const response = await _get(`projects?action=list&user=${userId}`);
    //filter the projects so that private ones arent shown
    const projects = response.projects.filter(
      (proj) => !(proj.private && proj.user !== userId),
    );
    dispatch(setProjects(projects));
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

  //updates the project features with target values that have changed
  const updateProjectFeatures = async (features = projectFeatures) => {
    const getFeatureId = (item) => item.id ?? item.feature_unique_id;

    const join = (getter) =>
      features
        .map(getter)
        .filter((v) => v !== undefined && v !== null)
        .join(",");

    const formData = new FormData();
    formData.append("user", projectResp.user);
    formData.append("project_id", project.id);

    formData.append(
      "interest_features",
      join((feature) => getFeatureId(feature)),
    );
    formData.append(
      "target_values",
      join((feature) => feature.target_value),
    );
    formData.append(
      "spf_values",
      join((feature) => feature.spf),
    );

    return await _post("projects?action=update_features", formData);
  };

  //preprocess a single feature
  const preprocessSingleFeature = async (featureId) => {
    startLogging();
    await preprocessFeature(featureId);
  };

  //preprocess synchronously, i.e. one after another
  const preprocessAllFeatures = async () => {
    for (const feature of projectFeatures) {
      if (!feature.preprocessed) {
        await preprocessFeature(feature);
      }
    }
  };

  //preprocesses a feature using websockets - i.e. intersects it with the planning units grid and writes the intersection results into the database. this will have no server timeout as its running using websockets
  const preprocessFeature = async (featureId) => {
    try {
      // Switch to the log tab
      const planningGridId = metadata.pu_id;
      dispatch(setActiveTab("log"));
      // Call the WebSocket
      const message = await handleWebSocket(
        `preprocessFeature?project_id=${activeProjectId}&planning_grid_id=${planningGridId}&feature_id=${featureId}`,
      );
      showMessage(message.info, "info");
      console.log("message ", message);
      // Update feature with new data
      updateFeature(featureId, {
        preprocessed: true,
        pu_count: Number(message.pu_count),
        pu_area: Number(message.pu_area),
        occurs_in_planning_grid: Number(message.pu_count) > 0,
      });
      dispatch(
        toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: false }),
      );
      return message;
    } catch (error) {
      console.error("Error preprocessing feature:", error);
      throw error; // Re-throw the error to handle it further up the call stack if needed
    }
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
    console.log(
      "uploading file with value, filename, destFolder ",
      value,
      ", ",
      filename,
      ", ",
      destFolder,
    );
    dispatch(setLoading(true));

    const formData = new FormData();
    formData.append("value", value); // The binary data for the file
    formData.append("filename", filename); // The filename
    formData.append("destFolder", destFolder); // The folder to upload to

    try {
      const resp = await _post("uploadFileToFolder", formData);
      return resp;
    } catch (error) {
      console.log("error ", error);
      throw new Error("Failed to upload file to folder: ", error);
    }
  };

  //uploads a list of files to the current project
  const uploadFiles = async (files, proj) => {
    for (const file of files) {
      if (file.name.endsWith(".dat")) {
        const formData = new FormData();
        formData.append("user", uiState.owner);
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
    formData.append("user", uiState.owner);
    formData.append("project", project);
    formData.append("filename", `input/${filename}`);
    formData.append("value", value);

    try {
      return await _post("uploadFile", formData);
    } catch (error) {
      throw new Error("Failed to upload file");
    }
  };

  //pads a number with zeros to a specific size, e.g. pad(9,5) => 00009
  const pad = (num, size) => num.toString().padStart(size, "0");

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
          renderer.CLASSIFICATION,
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

  const renderPuPrioritizrLayer = (runResults) => {
    // runResults should be array of { h3_index: "892...", solution: 0/1 or numeric }
    const propId = puLayerIdsRef.current?.propId || "h3_index";
    const resultsLayerId = puLayerIdsRef.current?.resultsLayerId;

    if (
      !map.current ||
      !resultsLayerId ||
      !map.current.getLayer(resultsLayerId)
    ) {
      console.warn("Results layer not ready yet.");
      return;
    }

    if (!runResults?.length) {
      // clear
      map.current.setPaintProperty(
        resultsLayerId,
        "fill-color",
        "rgba(0,0,0,0)",
      );
      showLayer(resultsLayerId);
      return;
    }

    // If solution is binary 0/1: show selected as solid, unselected transparent.
    // If solution is rank/score, you can bucket it like costs (see note below).
    const selectedIds = runResults
      .filter((r) => Number(r.solution) === 1)
      .map((r) => String(r.h3_index));

    // const fillExpr = ["match", ["get", propId]];
    // if (selectedIds.length) fillExpr.push(selectedIds, "rgba(255, 64, 129, 0.75)"); // selected
    // fillExpr.push("rgba(0,0,0,0)"); // fallback

    const fillExpr = [
      "case",
      ["in", ["to-string", ["get", propId]], ["literal", selectedIds]],
      "rgba(255, 64, 129, 0.75)",
      "rgba(0,0,0,0)",
    ];

    map.current.setPaintProperty(resultsLayerId, "fill-color", fillExpr);
    map.current.setPaintProperty(
      resultsLayerId,
      "fill-outline-color",
      "rgba(0,0,0,0)",
    );

    setLayerMetadata(resultsLayerId, {
      run_type: "prioritizr",
      selected_count: selectedIds.length,
      run_id: selectedRunId,
    });

    showLayer(resultsLayerId);
  };

  const renderPuCostLayer = (cost_data) => {
    const propId = puLayerIdsRef.current?.propId || "h3_index"; // single truth
    const costsLayerId = puLayerIdsRef.current?.costsLayerId;

    if (!map.current || !costsLayerId || !map.current.getLayer(costsLayerId)) {
      console.warn("Costs layer not ready yet.");
      return;
    }

    const buildExpression = (groups) => {
      if (!groups || groups.length === 0) {
        return "rgba(239, 27, 27, 0.7)";
      }
      const expression = ["match", ["get", propId]];
      groups.forEach((h3List, index) => {
        if (h3List.length > 0) {
          expression.push(h3List, CONSTANTS.COST_COLORS[index]);
        }
      });
      expression.push("rgba(150, 150, 150, 0)"); // fallback
      return expression;
    };
    const expression = buildExpression(cost_data.data);
    map.current.setPaintProperty(costsLayerId, "fill-color", expression);
    setLayerMetadata(costsLayerId, {
      min: cost_data.min,
      max: cost_data.max,
      ranges: cost_data.ranges,
    });

    showLayer(costsLayerId);
    return "Marxan PU costs rendered";
  };

  const getPUData = useCallback(
    async (h3_index) => {
      const currentProjectId = projectIdRef.current;
      if (currentProjectId == null || !h3_index) return;

      const response = await _get(
        `planning-units?action=data&project_id=${currentProjectId}&h3_index=${h3_index}`,
      );

      console.log("planning unit data ", response);
      const features = response?.data?.features ?? [];
      const puData = response?.data?.pu_data ?? null;

      if (features.length) {
        // join ids onto the full feature data from RTKQ-cached project features
        joinArrays(features, projFeaturesRef.current ?? [], "species", "id");
      }

      dispatch(
        setIdentifyPlanningUnits({
          puData: puData,
          features,
        }),
      );
    },
    [dispatch],
  );

  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // MAP INSTANTIATION, LAYERS ADDING/REMOVING AND INTERACTION
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  // ----------------------------------------------------------------------------------------------- //
  const setLayerMetadata = (layerId, metadata) => {
    const layer = map.current.getLayer(layerId);
    if (layer) {
      // Use spread operator to merge metadata
      layer.metadata = { ...layer.metadata, ...metadata };
    }
  };

  //gets a particular set of layers based on the layer types (layerTypes is an array of layer types)
  const getLayers = useCallback((layerTypes = []) => {
    if (!map.current) return [];
    if (!mapContainer.current) return [];

    // style may not be ready yet
    const style = map.current.getStyle?.();
    const allLayers = style?.layers ?? [];

    return allLayers.filter(({ metadata }) => {
      const type = metadata?.type;
      return type && layerTypes.includes(type);
    });
  }, []);

  //shows/hides layers of a particular type (layerTypes is an array of layer types)
  const showHideLayerTypes = (layerTypes, show) => {
    const layers = getLayers(layerTypes);
    layers.forEach((layer) =>
      show ? showLayer(layer.id) : hideLayer(layer.id),
    );
  };

  //instantiates the mapboxgl map
  // instantiates the mapboxgl map
  const createMap = (url) => {
    // map already exists: switch style & wait for it
    if (map.current) {
      const targetStyle = url || map.current.getStyle()?.sprite || null; // any truthy url is fine
      return new Promise((resolve) => {
        if (!url) {
          // no style change requested; just ensure current style is ready
          if (map.current.isStyleLoaded && map.current.isStyleLoaded()) {
            resolve("Map style loaded");
          } else {
            map.current.once("style.load", () => resolve("Map style loaded"));
          }
          return;
        }
        // set listener BEFORE setStyle to avoid missing the event
        map.current.once("style.load", () => resolve("Map style loaded"));
        map.current.setStyle(url);
      });
    }

    // no map yet — make sure container exists
    if (!mapContainer.current) {
      console.warn("Map container not ready yet.");
      // return a resolved promise so callers that await won't hang
      return Promise.resolve("Container not ready");
    }

    // Create a new Mapbox map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: url || "mapbox://styles/craicerjack/cm4co2ve7000l01pfchhs2vv8",
      center: [-18, 55],
      zoom: 4,
    });
    // save globally for hot reloading
    if (import.meta.hot) window._mapInstance = map.current;

    // Event handlers (use .once where appropriate to avoid duplicates)
    map.current.on("load", mapLoaded);
    map.current.on("error", mapError);
    map.current.on("click", mapClick);
    map.current.on("idle", updateLegend);

    // Resolve when the initial style is ready
    return new Promise((resolve) => {
      map.current.once("style.load", () => resolve("Map style loaded"));
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
      }),
    );
    map.current.on("draw.create", polygonDrawn);

    const COSTS_SOURCE = "bioprotect_pu_source";
    const COSTS_LAYER = CONSTANTS.COSTS_LAYER_NAME; // e.g. "bioprotect_pu_costs_layer"

    // ✅ Only add once to prevent duplicate-layer errors
    if (!map.current.getSource(COSTS_SOURCE)) {
      // Example source — if you’re using H3 grid GeoJSON from your backend
      map.current.addSource(COSTS_SOURCE, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [], // initially empty; can load data later
        },
      });
    }

    // ✅ Add the layer if it doesn’t already exist
    if (!map.current.getLayer(COSTS_LAYER)) {
      map.current.addLayer({
        id: COSTS_LAYER,
        type: "fill",
        source: COSTS_SOURCE,
        paint: {
          "fill-color": "rgba(0,0,0,0)", // start transparent
          "fill-opacity": 0.7,
        },
      });
    }
  };

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

    if (
      message !== "http status 200 returned without content." ||
      message == ""
    ) {
      showMessage(
        `MapError: ${message}, Error status: ${e.error.status}`,
        "error",
      );
      console.error(message);
    }
  }, []);

  const mapClick = useCallback(
    async (e) => {
      try {
        const isEditing = puEditingRef.current;
        const isDrawing = map.current?.getSource("mapbox-gl-draw-cold");
        if (isEditing || isDrawing) return;

        setPopupPoint(e.point);
        ///////////////////////////////////////////
        // Planning unit layer
        ///////////////////////////////////////////
        const puLayers = getLayers([CONSTANTS.LAYER_TYPE_PLANNING_UNITS]);
        let puid = null;

        if (puLayers.length) {
          const puHits = map.current.queryRenderedFeatures(e.point, {
            layers: puLayers.map((l) => l.id),
          });

          if (puHits.length) {
            const props = puHits[0].properties;
            puid = props.h3_index || props.puid || props.id;
          }
        }
        if (puid) {
          await getPUData(puid); // sets puData + puFeatures
        } else {
          // clear PU data if none found
          dispatch(setIdentifyPlanningUnits({ puData: null, features: [] }));
        }

        ///////////////////////////////////////////
        // Feature layers
        ///////////////////////////////////////////
        const featureLayers = getLayers([CONSTANTS.LAYER_TYPE_FEATURE_LAYER]);
        let identifiedFeatures = [];

        if (featureLayers.length) {
          const featureHits = map.current.queryRenderedFeatures(e.point, {
            layers: featureLayers.map((l) => l.id),
          });

          const uniqueSourceLayers = [
            ...new Set(featureHits.map((f) => f.sourceLayer)),
          ];

          const featuresList = projFeaturesRef.current ?? [];

          identifiedFeatures = uniqueSourceLayers
            .map((sourceLayer) =>
              featuresList.find((f) => f.feature_class_name === sourceLayer),
            )
            .filter(Boolean);
        }

        dispatch(
          setIdentifyPlanningUnits({
            identifiedFeatures,
          }),
        );

        dispatch(
          togglePUD({
            dialogName: "hexInfoDialogOpen",
            isOpen: true,
          }),
        );
      } catch (error) {
        console.error("Error handling map click:", error);
      }
    },
    [dispatch, getPUData, getLayers],
  );

  ////////////////////////////////////////
  // KEEP AN EYE ON THIS
  ////////////////////////////////////////
  useEffect(() => {
    if (!map.current) return;
    map.current.off("click", mapClick);
    map.current.on("click", mapClick);
    return () => map.current?.off("click", mapClick);
  }, [mapClick]);

  //after a layer has been added/removed/shown/hidden update the legend items
  const updateLegend = () => {
    if (!map.current) return;

    // Get visible Marxan layers
    const nextVisibleLayers = map.current
      .getStyle()
      .layers.filter(
        (layer) =>
          layer.id.includes("martin_") &&
          layer.layout?.visibility === "visible",
      )
      // ✅ Enrich each with inferred metadata
      .map((layer) => {
        const id = layer.id.toLowerCase();
        let inferredType;
        if (id.includes("results"))
          inferredType = CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS;
        else if (id.includes("cost"))
          inferredType = CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST;
        else if (id.includes("status"))
          inferredType = CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS;
        else if (id.includes("pu"))
          inferredType = CONSTANTS.LAYER_TYPE_PLANNING_UNITS;
        else if (id.includes("feature_pu"))
          inferredType = CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER;
        else if (id.includes("feature"))
          inferredType = CONSTANTS.LAYER_TYPE_FEATURE_LAYER;
        else if (id.includes("wdpa"))
          inferredType = CONSTANTS.LAYER_TYPE_PROTECTED_AREAS;

        return {
          ...layer,
          metadata: {
            ...(layer.metadata || {}),
            type: layer.metadata?.type || inferredType,
            name: layer.metadata?.name || layer.id, // fallback to id if no name
          },
        };
      });

    const prev = visibleLayersRef.current;

    if (
      prev.length === nextVisibleLayers.length &&
      prev.every(
        (p, i) =>
          p.id === nextVisibleLayers[i].id &&
          p.metadata?.type === nextVisibleLayers[i].metadata?.type &&
          p.layout?.visibility === nextVisibleLayers[i].layout?.visibility,
      )
    ) {
      return;
    }

    visibleLayersRef.current = nextVisibleLayers;
    setVisibleLayers(nextVisibleLayers);
  };

  //gets a set of features that have a layerid that starts with the passed text
  const getFeaturesByLayerStartsWith = (features, startsWith) =>
    features.filter((item) => item.layer.id.startsWith(startsWith));

  //joins a set of data from one object array to another
  const joinArrays = (arr1, arr2, leftId, rightId) => {
    return arr1.map((item1) => {
      // Find the matching item in the second array
      const matchingItem = arr2.find(
        (item2) => item2[rightId] === item1[leftId],
      );
      // Merge the items if a match is found
      return matchingItem ? { ...item1, ...matchingItem } : item1;
    });
  };

  //sets the basemap either on project load, or if the user changes it
  const loadBasemap = async (basemap) => {
    if (uiState.basemap === basemap.name && map.current) {
      // Basemap is already set and map exists; no action needed
      return;
    }
    try {
      dispatch(setBasemap(basemap.name));
      const style = await getValidStyle(basemap);
      // await createMap(style);
      if (map.current) {
        map.current.setStyle(style);
      } else {
        console.warn("Map not ready yet; skipping style load");
      }

      // Add the planning unit layers (if a project has already been loaded)
      if (tileset) {
        addPlanningGridLayers(tileset.name);
        if (uiState.owner) {
          // await getResults(uiState.owner, project);
        }
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

        // Update the style with the fetched
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

  const changePlanningGrid = async (puLayerName) => {
    try {
      // Fetch tile metadata from Martin tile server
      const response = await fetch(`${tilesUrl}${puLayerName}`);
      if (!response.ok) throw new Error("Failed to fetch tileset metadata");
      const data = await response.json();
      // Remove any existing PU-related layers and sources
      removePlanningGridLayers();
      // Add layers for the new planning unit grid
      addPlanningGridLayers(data.name);
      // Zoom to bounds if available
      if (data.bounds) {
        zoomToBounds(map, data.bounds);
      }
      // Update local state with tileset info
      setTileset(data);
      return data;
    } catch (error) {
      console.error("Error loading planning grid:", error);
      showMessage(error.message || "Error loading planning grid", "error");
      throw error;
    }
  };

  //gets all of the metadata for the tileset
  const getMetadata = async (tilesetId) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/v4/${tilesetId}.json?secure&access_token=${mapboxgl.accessToken}`,
      );

      const data = await response.json();
      if (data.message && data.message.includes("does not exist")) {
        throw new Error(
          `The tileset '${tilesetId}' was not found. See <a href='${CONSTANTS.ERRORS_PAGE}#the-tileset-from-source-source-was-not-found' target='_blank'>here</a>`,
        );
      }
      return data;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      throw error;
    }
  };

  //adds the results, planning unit, planning unit edit etc layers to the map
  // const addPlanningGridLayers = (tileset) => {
  const addPlanningGridLayers = (puLayerName) => {
    if (!map.current) return;

    const sourceId = `martin_src_${puLayerName}`;
    const resultsLayerId = `martin_layer_results_${puLayerName}`;
    const costsLayerId = `martin_layer_costs_${puLayerName}`;
    const puLayerId = `martin_layer_pu_${puLayerName}`;
    const statusLayerId = `martin_layer_status_${puLayerName}`;
    // Store layer and source IDs in a ref for later use
    puLayerIdsRef.current = {
      sourceId,
      resultsLayerId,
      costsLayerId,
      puLayerId,
      statusLayerId,
      sourceLayerName: puLayerName,
      propId: "h3_index",
    };

    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: "vector",
        url: `${tilesUrl}${puLayerName}`,
        promoteId: "h3_index", // treat each hex id as its unique feature id - helps with rendering
      });
    }

    [resultsLayerId, costsLayerId, puLayerId, statusLayerId].forEach(
      (layerId) => {
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      },
    );

    //add the results layer
    addMapLayer({
      id: resultsLayerId,
      metadata: {
        name: "Results",
        type: CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS,
      },
      type: "fill",
      source: sourceId,
      layout: {
        visibility: "visible",
      },
      "source-layer": puLayerName,
      paint: {
        "fill-color": "rgba(0, 0, 0, 0)",
        "fill-outline-color": "rgba(0, 0, 0, 0)",
        "fill-opacity": CONSTANTS.RESULTS_LAYER_OPACITY,
      },
    });
    //add the planning units costs layer
    addMapLayer({
      id: costsLayerId,
      metadata: {
        name: "Planning Unit Cost",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST,
      },
      type: "fill",
      source: sourceId,
      layout: {
        visibility: "none",
      },
      "source-layer": puLayerName,
      paint: {
        "fill-color": "rgba(255, 0, 0, 0)",
        "fill-outline-color": "rgba(150, 150, 150, 0)",
        "fill-opacity": CONSTANTS.PU_COSTS_LAYER_OPACITY,
      },
    });

    addMapLayer({
      id: puLayerId,
      metadata: {
        name: "Planning Unit",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS,
      },
      minzoom: 0,
      maxzoom: 24,
      type: "fill",
      source: sourceId,
      layout: {
        visibility: "visible",
      },
      "source-layer": puLayerName,
      paint: {
        "fill-color": "rgba(0, 0, 0, 0)",
        "fill-outline-color": `rgba(150, 150, 150, ${CONSTANTS.PU_LAYER_OPACITY})`,
        "fill-opacity": CONSTANTS.PU_LAYER_OPACITY,
      },
    });

    //add the planning units manual edit layer - this layer shows which individual planning units have had their status changed
    addMapLayer({
      id: statusLayerId,
      metadata: {
        name: "Planning Unit Status",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS,
      },
      minzoom: 0,
      maxzoom: 24,
      type: "fill",
      source: sourceId,
      layout: { visibility: "none" },
      "source-layer": puLayerName,
      paint: {
        "fill-color": [
          "case",
          ["==", ["feature-state", "status"], 0],
          "rgba(150,150,150,0)",
          ["==", ["feature-state", "status"], 1],
          "rgba(63,63,191,1)",
          ["==", ["feature-state", "status"], 2],
          "rgba(191, 63, 63, 1)",
          "rgba(150,150,150,0)", // default
        ],
        "fill-opacity": 0.8,
      },
    });
    //set the result layer in app state so that it can update the Legend component and its opacity control
    setResultsLayer(map.current.getLayer(resultsLayerId));
    if (selectedRunId && runResults?.length) {
      // slight delay not required, layer exists now
      renderPuPrioritizrLayer(runResults);
    }
  };

  const removePlanningGridLayers = (puLayerName) => {
    // if a puLayerName passed in remove that layer otherwise remove all layers
    if (!map.current || !map.current.getStyle()) return;

    const style = map.current.getStyle();
    const layers = style.layers || [];

    if (puLayerName) {
      // Targeted cleanup for a specific tileset
      const sourceId = `martin_src_${puLayerName}`;
      const layersToRemove = [
        `martin_layer_results_${puLayerName}`,
        `martin_layer_costs_${puLayerName}`,
        `martin_layer_pu_${puLayerName}`,
        `martin_layer_status_${puLayerName}`,
      ];

      layersToRemove.forEach((item) => removeMapLayer(item));
      removeMapSource(sourceId);
    } else {
      // Get dynamically added layers, remove them, and then remove sources
      layers
        .filter((l) => l.id.startsWith("martin_layer_"))
        .forEach((l) => removeMapLayer(l.id));

      const possibleSourceIds = new Set();
      layers.forEach((l) => {
        if (l.source && l.source.startsWith("martin_src_")) {
          possibleSourceIds.add(l.source);
        }
      });
      // As an extra safety, try removing any source id that currently exists and matches the prefix
      // by reading the style object (MapLibre/Mapbox keeps sources in style.sources).
      const styleSources = (style.sources && Object.keys(style.sources)) || [];
      styleSources
        .filter((id) => id.startsWith("martin_src_"))
        .forEach((id) => possibleSourceIds.add(id));

      possibleSourceIds.forEach(removeMapSource);
    }
  };

  const toggleLayerVisibility = (id, visibility) => {
    if (!map.current) {
      console.warn("Map is not ready yet.");
      return;
    }

    if (map.current.getLayer(id)) {
      map.current.setLayoutProperty(id, "visibility", visibility);
      updateLegend();
    }
  };

  const showLayer = (id) => toggleLayerVisibility(id, "visible");

  const hideLayer = (id) => toggleLayerVisibility(id, "none");

  //centralised code to add a layer to the maps current style
  const addMapLayer = (mapLayer, beforeLayer) => {
    if (!map.current) return;
    if (map.current.getLayer(mapLayer.id)) return;
    // If a beforeLayer is not passed get the first symbol layer (i.e. label layer)
    if (!beforeLayer) {
      const style = map.current.getStyle();
      if (!style || !style.layers) return; // style not ready yet
      const symbolLayers = style.layers.filter(
        (layer) => layer.type === "symbol",
      );
      beforeLayer = symbolLayers.length ? symbolLayers[0].id : undefined;
    }
    // Add the layer to the map
    try {
      map.current.addLayer(mapLayer, beforeLayer);
      updateLegend();
    } catch (err) {
      console.error("Error adding map layer:", err);
    }
  };

  //centralised code to remove a layer from the maps current style
  const removeMapLayer = (layerId) => {
    if (!map.current?.getLayer(layerId)) return;
    map.current.removeLayer(layerId);
    updateLegend();
  };
  const removeMapSource = (layerid) => map.current.removeSource(layerid);

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
        CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER,
      ],
      false,
    );
    //render the planning units status layer_edit layer
    // renderPuEditLayer(CONSTANTS.STATUS_LAYER_NAME);
  };

  //fired whenever another tab is selected
  const setPUTabInactive = () => {
    showLayer(CONSTANTS.RESULTS_LAYER_NAME);
    showHideLayerTypes(
      [
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ],
      true,
    );
    hideLayer(CONSTANTS.PU_LAYER_NAME);
    hideLayer(CONSTANTS.STATUS_LAYER_NAME);
    hideLayer(CONSTANTS.COSTS_LAYER_NAME);
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
      togglePUD({
        dialogName: "planningGridDialogOpen",
        isOpen: true,
      }),
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
        description,
      );
      messageLogger({
        method: "importPlanningUnitGrid",
        status: "Finished",
        info: response.info,
      });
      dispatch(
        togglePUD({
          dialogName: "importPlanningGridDialogOpen",
          isOpen: false,
        }),
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
          "The planning grid is used in the following projects",
        );
      }
    }
  };

  //deletes a planning grid
  const deletePlanningGrid = async (feature_class_name, silent) => {
    const response =
      await useDeletePlanningUnitGridMutation(feature_class_name);
    //update the planning unit grids

    showMessage(response.info, "info", silent);
  };

  //exports a planning grid to a zipped shapefile
  const exportPlanningGrid = async (featureName) => {
    try {
      const response = await useExportPlanningUnitGridQuery(featureName);
      return `${bioprotectServer.endpoint} exports / ${response.filename} `;
    } catch (error) {
      throw new Error("Failed to export planning grid");
    }
  };

  //gets a list of projects that use a particular planning grid
  const getProjectsForPlanningGrid = async (feature_class_name) =>
    await _get(
      `listProjectsForPlanningGrid ? feature_class_name = ${feature_class_name} `,
    );

  const getCountries = async () => {
    const response = await _get("getCountries");
    setCountries(response.records);
  };

  const pollStatus = async (uploadid) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/uploads/v1/${CONSTANTS.MAPBOX_USER}/${uploadid}?access_token=${uiState.registry.MBAT}`,
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
        showMessage(errorMsg, "error");
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
    if (timers.length === 0) {
      setUploading(false);
    }
  };

  const openWelcomeDialog = () => {
    parseNotifications();
    setWelcomeDialogOpen(true);
  };

  // const openFeaturesDialog = async (showClearSelectAll) => {
  const openFeaturesDialog = async () => {
    // Refresh features list if we are using a hosted service (other users could have created/deleted items) and the project is not imported (only project features are shown)
    // dispatch(setAddingRemovingFeatures(showClearSelectAll));
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: true,
      }),
    );
  };

  const openPlanningGridsDialog = async () => {
    dispatch(
      togglePUD({
        dialogName: "planningGridsDialogOpen",
        isOpen: true,
      }),
    );
  };

  //used by the import wizard to import a users zipped shapefile as the planning units
  //the zipped shapefile has been uploaded to the MARXAN folder - it will be imported to PostGIS and a record will be entered in the metadata_planningUnits table
  const importZippedShapefileAsPu = async (zipname, alias, description) =>
    await _get(
      `importPlanningUnitGrid?filename=${zipname}&name=${alias}&description=${description}`,
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
    dispatch(setLoading(true));
    if (atlasLayers.length < 1) {
      const data = await getAtlasLayers();
      setAtlasLayers(data);
    }
    dispatch(
      toggleDialog({ dialogName: "atlasLayersDialogOpen", isOpen: true }),
    );
    dispatch(setLoading(false));
  };

  const openCumulativeImpactDialog = async () => {
    dispatch(setLoading(true));
    if (uiState.allImpacts.length < 1) {
      const response = await _get("getAllImpacts");
      setAllImpacts(response.data);
    }
    dispatch(
      toggleDialog({ dialogName: "cumulativeImpactDialogOpen", isOpen: true }),
    );
    dispatch(setLoading(false));
  };

  //makes a call to get the impacts from the server and returns them
  const getImpacts = async () => {
    const response = await _get("getAllImpacts");
    setAllImpacts(response.data);
  };

  const addSource = async (sourceName, tileUrl) => {
    map.current.addSource(sourceName, {
      type: "raster",
      tiles: [tileUrl],
      tileSize: 256,
    });
  };

  const addLayer = async (sourceName) => {
    if (!map.current || map.current.getLayer(sourceName)) return;

    map.current.addLayer({
      id: sourceName,
      type: "raster",
      source: sourceName,
      layout: {
        visibility: "none",
      },
    });

    updateLegend();
  };

  const getAtlasLayers = async () => {
    try {
      const response = await fetch(
        bioprotectServer.endpoint + "getAtlasLayers",
        {
          credentials: "include",
        },
      );
      const data = await response.json();
      const parsedData = data.map(JSON.parse);

      for (const layer of parsedData) {
        const sourceName = layer.layer;
        const tileUrl = `http://www.atlas-horizon2020.eu/gs/ows?layers=${sourceName}&service=WMS&request=GetMap&format=image/png&transparent=true&width=256&height=256&srs=EPSG:3857&bbox={bbox - epsg - 3857}`;

        // Add the source and layer to the map
        await addSource(sourceName, tileUrl);
        await addLayer(sourceName);
      }

      return parsedData;
    } catch (error) {
      console.error("Failed to fetch and add Atlas layers:", error);
    }
  };

  const openCostsDialog = async () => {
    if (!uiState.allImpacts?.length) {
      await getImpacts();
    }
    setCostsDialogOpen(true);
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
      prevState.selectedImpactIds.filter((imp) => imp !== impact.id),
    );
  };

  //toggles the impact layer on the map
  const toggleImpactLayer = (impact) => {
    if (impact.tilesetid === "") {
      showMessage(`This feature does not seem to have a tileset.`, "error");
      return;
    }
    // this.closeImpactMenu();
    const layerName = impact.tilesetid.split(".")[1];
    const layerId = "marxan_impact_layer_" + layerName;
    // const layerId = "martin_impact_layer_" + layerName;
    // const tilesURL = `/tiles/${layerName}/{z}/{x}/{y}.png`;

    if (map.current.getLayer(layerId)) {
      removeMapLayer(layerId);
      map.current.removeSource(layerId);
      updateImpact(impact, { impact_layer_loaded: false });
    } else {
      //if a planning units layer for a impact is visible then we need to add the impact layer before it - first get the impact puid layer
      const layers = getLayers([CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER]);
      const beforeLayer = layers.length > 0 ? layers[0].id : undefined;

      map.current.addSource(layerId, {
        type: "raster",
        tiles: [tilesURL],
        tileSize: 256,
      });

      const rasterLayer = {
        id: layerId,
        type: "raster",
        source: layerId,
        layout: {
          visibility: "visible",
        },
        paint: {
          "raster-opacity": 0.85,
        },
        metadata: {
          name: impact.alias,
          type: "impact",
        },
      };

      addMapLayer(rasterLayer, beforeLayer);
      updateImpact(impact, { impact_layer_loaded: true });
    }
  };

  //gets the ids of the selected impacts
  const getSelectedImpactIds = () => {
    // Use map and filter to get selected impact IDs in one line
    const ids = uiState.allImpacts
      .filter((impact) => impact.selected)
      .map((impact) => impact.id);

    // Update the state with the selected impact IDs
    setSelectedImpactIds(ids);
  };

  //updates the properties of a impact and then updates the impacts state
  const updateImpact = (impact, newProps) => {
    // Create a shallow copy of the impacts array
    const impacts = [...uiState.allImpacts];

    // Find the index of the impact to update
    const index = impacts.findIndex((element) => element.id === impact.id);

    if (index !== -1) {
      // Create a new impact object with updated properties
      impacts[index] = { ...impacts[index], ...newProps };

      // Update the state
      setAllImpacts(impacts);

      // Update projectImpacts based on the selected impacts
      dispatch(setProjectImpacts(impacts.filter((item) => item.selected)));
    }
  };

  const runCumulativeImpact = async (selectedUploadedActivityIds) => {
    dispatch(setLoading(true));
    startLogging();

    await handleWebSocket(
      `runCumumlativeImpact?selectedIds=${selectedUploadedActivityIds}`,
    );
    dispatch(setLoading(false));
    return "Cumulative Impact Layer uploaded";
  };

  const uploadRaster = async (data) => {
    dispatch(setLoading(true));
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

  //create new impact from the created pressures
  const saveActivityToDb = async (filename, selectedActivity, description) => {
    //start the logging
    dispatch(setLoading(true));
    startLogging();
    const url = `saveRaster?filename=${filename}&activity=${selectedActivity}&description=${description}`;
    await handleWebSocket(url);
    dispatch(setLoading(false));
    return "Raster saved to db";
  };

  const createCostsFromImpact = async (data) => {
    dispatch(setLoading(true));
    startLogging();
    await handleWebSocket(
      `createCostsFromImpact?user=${uiState.owner}&project=${project}&pu_filename=${metadata.PLANNING_UNIT_NAME}&impact_filename=${data.feature_class_name}&impact_type=${data.alias}`,
    );
    dispatch(setLoading(false));
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
  const updateFeatureById = (features, featureId, newProps) =>
    features.map((f) =>
      (f.id ?? f.feature_unique_id) === featureId ? { ...f, ...newProps } : f,
    );
  //updates the properties of a feature and then updates the features state
  const updateFeature = async (featureId, newProps) => {
    // optimistic patch for one item using RTK Query cache
    const patchGlobal = dispatch(
      setOneFeatureInCache({ id: featureId, patch: newProps }),
    );
    // update derived project features
    const patchProject = dispatch(
      projectApiSlice.util.updateQueryData(
        "getProject",
        activeProjectId,
        (draft) => {
          if (!draft?.features) return;

          const f = draft.features.find(
            (pf) => (pf.id ?? pf.feature_unique_id) === featureId,
          );

          if (f) {
            Object.assign(f, newProps);
          }
        },
      ),
    );
  };

  //removes a feature from the selectedFeatureIds array
  const removeFeature = (feature) => {
    const updatedFeatureIds = featureState.selectedFeatureIds.filter(
      (id) => id !== feature.id,
    );
    dispatch(setSelectedFeatureIds(updatedFeatureIds));
  };

  //adds a feature to the selectedFeatureIds array
  const addFeature = (feature) => {
    const next = featureState.selectedFeatureIds.includes(feature.id)
      ? featureState.selectedFeatureIds
      : [...featureState.selectedFeatureIds, feature.id];
    dispatch(setSelectedFeatureIds(next));
  };

  //starts a digitising session
  const initialiseDigitising = () => {
    // Show digitising controls if not already present, mapbox-gl-draw-cold + mapbox-gl-draw-hot
    if (!map.current.getSource("mapbox-gl-draw-cold")) {
      map.current.addControl(mapboxDrawControls);
    }
  };

  //called when the user has drawn a polygon on screen
  const polygonDrawn = (evt) => {
    //open the new feature dialog for the metadata
    dispatch(
      toggleFeatureD({ dialogName: "newFeatureDialogOpen", isOpen: true }),
    );
    dispatch(setDigitisedFeatures(evt.features));
  };

  //updates the target values for all features in the project to the passed value
  const updateTargetValueForFeatures = async (target_value) => {
    const features = allFeatures.map((feature) => ({
      ...feature,
      target_value,
    }));
    const projectFeatures = features.filter((item) => item.selected);

    const patchAll = dispatch(setAllFeaturesInCache({ features: features }));
    // Update project features
    const patchProject = dispatch(
      projectApiSlice.util.updateQueryData(
        "getProject",
        activeProjectId,
        (draft) => {
          if (!draft?.features) return;
          draft.features = selected;
        },
      ),
    );

    // Persist the changes to the server
    if (userData?.role === "ReadOnly") return;

    // update the project featires on the server, or rollback on error
    try {
      await updateProjectFeatures(projectFeatures);
    } catch (err) {
      patchAll?.undo?.();
      patchProject?.undo?.();
      showMessage?.(`Failed to save target values. Reverted. ${err}`, "error");
    }
  };

  //previews the feature
  const previewFeature = (featureMetadata) => {
    dispatch(setFeatureMetadata(featureMetadata));
    dispatch(toggleFeatureD({ dialogName: "featureDialogOpen", isOpen: true }));
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
    splitfield,
  ) => {
    startLogging();

    const baseUrl = `importFeatures?zipfile=${zipfile}&shapefile=${shapefile}`;
    const url =
      name !== ""
        ? `${baseUrl}&name=${name}&description=${description}`
        : `${baseUrl}&splitfield=${splitfield}`;

    try {
      const message = await handleWebSocket(url);
      return message;
    } catch (error) {
      console.error("Feature import failed:", error);
      showMessage(error.message || "Failed to import features", "error");
      throw error; // re-throw if you want the caller to handle it too
    }
  };

  const zoomToLayer = (tileJSON) => {
    fetch(`${tileJSON}`)
      .then((res) => res.json())
      .then((tj) => {
        if (tj.bounds) {
          map.current.fitBounds(
            [
              [tj.bounds[0], tj.bounds[1]],
              [tj.bounds[2], tj.bounds[3]],
            ],
            { padding: 20 },
          );
        }
      });
  };

  //gets the feature ids as a set from the allFeatures array
  const getFeatureIds = (_features) =>
    new Set(_features.map((item) => item.id));

  //refreshes the allFeatures state
  const refreshFeatures = async () => {
    // Fetch the latest features
    const before = allFeatures;
    const newFeatures = await refetchAllFeatures().unwrap();
    const newFeats = newFeatures?.data ?? newFeatures ?? [];

    // Extract existing and new feature IDs
    const existingFeatureIds = getFeatureIds(before);
    const newFeatureIds = getFeatureIds(newFeats);

    // Determine which features have been removed or added
    const removedFeatureIds = [...existingFeatureIds].filter(
      (id) => !newFeatureIds.has(id),
    );
    const addedFeatureIds = [...newFeatureIds].filter(
      (id) => !existingFeatureIds.has(id),
    );

    // Remove features that are no longer present
    if (removedFeatureIds.length) {
      dispatch(removeFeaturesFromCache({ ids: removedFeatureIds }));
    }

    // Initialize new features
    if (addedFeatureIds.length) {
      const added = newFeats
        .filter((f) => addedFeatureIds.includes(f.id))
        .map((f) => addFeatureAttributes(f));

      dispatch(addFeaturesToCache({ features: added }));
    }
  };

  //toggles the feature layer on the map
  const toggleFeatureLayer = useCallback(
    (feature) => {
      const tableName = feature.tilesetid
        ? feature.tilesetid.split(".")[1]
        : feature.feature_class_name;
      const sourceId = `martin_src_${tableName}`;
      const layerId = `martin_layer_${tableName}`;
      const tileJSON = `${tilesUrl}${tableName}`;

      if (map.current.getLayer(layerId)) {
        removeMapLayer(layerId);
        map.current.removeSource(sourceId);
        updateFeature(feature.id, { feature_layer_loaded: false });
      } else {
        // 1) make sure the vector‐tile source is added
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: "vector",
            url: tileJSON,
          });
        }

        const beforeLayer = (() => {
          const puLayers = getLayers([CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER]);
          return puLayers.length ? puLayers[0].id : undefined;
        })();

        const mapLayer = {
          id: layerId,
          type: getTypeProperty(feature),
          source: sourceId,
          "source-layer": tableName,
          layout: { visibility: "visible" },
          paint: getPaintProperty(feature),
          metadata: {
            name: feature.alias,
            type: CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
          },
        };

        addMapLayer(mapLayer, beforeLayer);
        updateFeature(feature.id, { feature_layer_loaded: true });
        // Helper function tozom to layer to see if its working
        // zoomToLayer(tileJSON)
      }
    },
    [
      map,
      tilesUrl,
      updateFeature,
      removeMapLayer,
      addMapLayer,
      getLayers,
      getPaintProperty,
      getTypeProperty,
    ],
  );

  //toggles the planning unit feature layer on the map
  const toggleFeaturePUIDLayer = async (feature) => {
    let layerName = `marxan_puid_${feature.id}`;

    if (map.current.getLayer(layerName)) {
      removeMapLayer(layerName);
      updateFeature(feature, { feature_puid_layer_loaded: false });
      return;
    }
    //get the planning units where the feature occurs
    const data = await triggerListFeaturePUs({
      owner: uiState.owner,
      project: project,
      featureId: feature.id,
    }).unwrap();

    addMapLayer({
      id: layerName,
      metadata: {
        name: feature.alias,
        type: CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER,
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

    data.data.forEach((puid) =>
      line_color_expression.push(puid, feature.color),
    );
    // Last value is the default, used where there is no data
    line_color_expression.push("rgba(0,0,0,0)");
    map.current.setPaintProperty(
      layerName,
      "line-color",
      line_color_expression,
    );
    //show the layer
    showLayer(layerName);
    updateFeature(feature.id, { feature_puid_layer_loaded: true });
  };

  //removes the current feature from the project
  const removeFromProject = async (feature) => {
    dispatch(toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: false }));
    removeFeature(feature);
    await updateSelectedFeatures();
  };

  //zooms to a features extent
  const zoomToFeature = (feature) => {
    dispatch(toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: false }));
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
      { padding: 100 },
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
      toggleProjDialog({ dialogName: "projectsDialogOpen", isOpen: true }),
    );
  };

  const openUsersDialog = async () =>
    dispatch(toggleDialog({ dialogName: "usersDialogOpen", isOpen: true }));

  const openRunLogDialog = async () => {
    await getRunLogs();
    await startPollingRunLogs();
    setRunLogDialogOpen(true);
  };

  const showProjectListDialog = (listOfProjects, title, heading) => {
    dispatch(setProjectList(listOfProjects));
    dispatch(setProjectListDialogHeading(heading));
    dispatch(setProjectListDialogTitle(title));
    dispatch(
      toggleProjDialog({
        dialogName: "projectsListDialogOpen",
        isOpen: true,
      }),
    );
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

  // Run Prioitizr
  // `/server/prioritizr?action=run&user=${}&project_id=${}`
  const runPrioitizr = async () => {
    console.log("userId ", userId);
    console.log("userId ", activeProjectId);
    try {
      // Switch to the log tab
      const planningGridId = metadata.pu_id;
      dispatch(setActiveTab("log"));
      // Call the WebSocket
      const message = await handleWebSocket(
        `prioritizr-ws?action=run&user=${userId}&project_id=${activeProjectId}`,
      );
      showMessage(message.info, "info");
      console.log("message ", message);

      return message;
    } catch (error) {
      console.error("Error running Prioirtizr:", error);
      throw error; // Re-throw the error to handle it further up the call stack if needed
    }
  };

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
      `updateCosts?user=${uiState.owner}&project=${project}&costname=${costname}`,
    );
    await refetchProject();
  };

  const loadCostsLayer = async (forceReload = false) => {
    try {
      setCostsLoading(true);
      // fetch from server (or cache)
      const response = await getPuCostsLayer(forceReload);
      const statusLayerId = puLayerIdsRef.current?.statusLayerId;
      if (map.current && statusLayerId && map.current.getLayer(statusLayerId)) {
        map.current.setLayoutProperty(statusLayerId, "visibility", "visible");
        map.current.setLayerZoomRange(statusLayerId, 0, 24);
      }
      // cache in Redux
      dispatch(setCostData(response));
      // render the Mapbox layer
      renderPuCostLayer(response);
    } catch (error) {
      console.error("Error loading costs layer:", error);
    } finally {
      setCostsLoading(false);
    }
  };

  const getPuCostsLayer = async (forceReload) => {
    const project_id = project.id;
    if (uiState.owner === "") {
      dispatch(setOwner(userId));
    }
    // if we already have it cached and no forceReload, return cache
    if (projState.costData && !forceReload) {
      return projState.costData;
    }
    // else hit the backend
    const url = `planning-units?action=get-cost-layer&user=${userId}&project_id=${project_id}`;
    const response = await _get(url);
    dispatch(setCostData(response));
    return response;
  };

  //after clicking cancel in the ImportCostsDialog
  const deleteCostFileThenClose = async (costname) => {
    if (costname) {
      await deleteCost(costname);
      dispatch(
        toggleDialog({
          dialogName: "importCostsDialogOpen",
          isOpen: true,
        }),
      );
    }
    return;
  };
  //adds a cost in application state
  const addCost = (costname) =>
    dispatch(setProjectCosts((prevState) => [...prevState, costname]));

  //deletes a cost file on the server
  const deleteCost = async (costname) => {
    await _get(
      `deleteCost?user=${uiState.owner}&project=${project}&costname=${costname}`,
    );
    const _costnames = projState.projectCosts.filter(
      (item) => item !== costname,
    );
    dispatch(setProjectCosts(_costnames));
    return;
  };
  //restores the database back to its original state and runs a git reset on the file system
  const resetServer = async () => {
    dispatch(setActiveTab("log"));
    await handleWebSocket("resetDatabase");
    dispatch(toggleDialog({ dialogName: "resetDialogOpen", isOpen: false }));
    return;
  };

  //cleans up the server - removes dissolved WDPA feature classes, deletes orphaned feature classes, scratch feature classes and clumping files
  const cleanup = async () => {
    return await _get("cleanup?");
  };

  if (import.meta?.hot) {
    import.meta.hot.dispose(() => {
      // ✅ Do nothing: keep map instance alive between reloads
      console.log("♻️ HMR reload — keeping existing map");
    });
  }

  return (
    <div>
      {uiState.loading && <Loading open={uiState.loading} />}

      <React.Fragment>
        <div
          ref={mapContainer}
          className="map-container absolute top right left bottom"
        ></div>
        {token ? null : (
          <LoginDialog
            open={!isLoggedIn}
            loading={uiState.loading}
            loadProjectAndSetup={loadProjectAndSetup}
          />
        )}
        <ResendPasswordDialog open={dialogStates.resendPasswordDialogOpen} />
        <ToolsMenu
          menuAnchor={menuAnchor}
          openUsersDialog={openUsersDialog}
          openRunLogDialog={openRunLogDialog}
          userRole={userData}
          metadata={metadata}
          cleanup={cleanup}
        />
        <UserMenu menuAnchor={menuAnchor} logout={handleLogOut} />
        {dialogStates.helpMenuOpen ? (
          <HelpMenu menuAnchor={menuAnchor} />
        ) : null}
        {dialogStates.userSettingsDialogOpen ? (
          <UserSettingsDialog
            open={dialogStates.userSettingsDialogOpen}
            onCancel={() =>
              dispatch(
                toggleDialog({
                  dialogName: "userSettingsDialogOpen",
                  isOpen: false,
                }),
              )
            }
            loading={uiState.loading}
            saveOptions={saveOptions}
            loadBasemap={loadBasemap}
          />
        ) : null}
        {dialogStates.usersDialogOpen ? (
          <UsersDialog
            open={dialogStates.usersDialogOpen}
            loading={uiState.loading}
            deleteUser={handleDeleteUser}
            changeRole={changeRole}
            guestUserEnabled={bioprotectServer.guestUserEnabled}
          />
        ) : null}
        {dialogStates.profileDialogOpen ? (
          <ProfileDialog
            open={dialogStates.profileDialogOpen}
            onOk={() =>
              dispatch(
                toggleDialog({
                  dialogName: "profileDialogOpen",
                  isOpen: false,
                }),
              )
            }
            onCancel={() =>
              dispatch(
                toggleDialog({
                  dialogName: "profileDialogOpen",
                  isOpen: false,
                }),
              )
            }
            loading={uiState.loading}
            updateUser={handleUpdateUser}
          />
        ) : null}
        {dialogStates.changePasswordDialogOpen ? (
          <ChangPasswordDialog open={dialogStates.changePasswordDialogOpen} />
        ) : null}

        <AboutDialog
          marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
          wdpaAttribution={wdpaAttribution}
        />
        {project && (
          <InfoPanel
            project={project}
            projectFeatures={projectFeatures}
            planningUnits={planningUnits}
            metadata={metadata}
            costname={metadata?.COSTS}
            costNames={costNames}
            map={map}
            onClickRef={onClickRef}
            onContextMenuRef={onContextMenuRef}
            pid={pid}
            changeCostname={changeCostname}
            puLayerIdsRef={puLayerIdsRef}
            _post={_post}
            puEditing={puEditing}
            setPuEditing={setPuEditing}
            // renderPuEditLayer={renderPuEditLayer}

            renameProject={renameProject}
            renameDescription={renameDescription}
            setPUTabInactive={setPUTabInactive}
            setPUTabActive={setPUTabActive}
            preprocessing={preprocessing}
            openFeaturesDialog={openFeaturesDialog}
            updateFeature={updateFeature}
            toggleProjectPrivacy={toggleProjectPrivacy}
            toggleFeatureLayer={toggleFeatureLayer}
            toggleFeaturePUIDLayer={toggleFeaturePUIDLayer}
            useFeatureColors={userData?.USEFEATURECOLORS}
            smallLinearGauge={smallLinearGauge}
            openCostsDialog={openCostsDialog}
            loadCostsLayer={loadCostsLayer}
            loading={uiState.loading}
            setMenuAnchor={setMenuAnchor}
            handleWebSocket={handleWebSocket}
            runPrioitizr={runPrioitizr}
            // protectedAreaIntersections={protectedAreaIntersections}
          />
        )}
        {project && (
          <ResultsPanel
            open={uiState.resultsPanelOpen}
            preprocessing={preprocessing}
            setClassificationDialogOpen={() =>
              dispatch(
                toggleDialog({
                  dialogName: "classificationDialogOpen",
                  isOpen: true,
                }),
              )
            }
            brew={brew}
            messages={logMessages}
            activeResultsTab={uiState.activeResultsTab}
            clearLog={() => dispatch(clearImportLog())}
            resultsLayer={resultsLayer}
            wdpaLayer={wdpaLayer}
            paLayerVisible={paLayerVisible}
            changeOpacity={changeOpacity}
            userRole={userData?.role}
            visibleLayers={visibleLayers}
            metadata={metadata}
            costsLoading={costsLoading}
          />
        )}
        {puState.dialogs.hexInfoDialogOpen ? (
          <HexInfoDialog xy={popupPoint} metadata={metadata} />
        ) : null}
        {projDialogStates.projectsDialogOpen ? (
          <ProjectsDialog
            loading={uiState.loading}
            deleteProject={deleteProject}
            exportProject={exportProject}
            cloneProject={cloneProject}
            unauthorisedMethods={unauthorisedMethods}
            userRole={userData?.role}
            loadProjectAndSetup={loadProjectAndSetup}
          />
        ) : null}
        <ProjectsListDialog />
        <NewProjectDialog
          loading={uiState.loading}
          selectedCosts={selectedCosts}
          previewFeature={previewFeature}
          fileUpload={uploadFileToFolder}
          updateSelectedFeatures={updateSelectedFeatures}
        />
        <NewPlanningGridDialog
          loading={uiState.loading || preprocessing || uploading}
          fileUpload={uploadFileToFolder}
        />
        <ImportPlanningGridDialog
          importPlanningUnitGrid={importPlanningUnitGrid}
          loading={uiState.loading || uploading}
          fileUpload={uploadFileToFolder}
        />
        <FeatureInfoDialog open={true} updateFeature={updateFeature} />
        <FeaturesDialog
          onOk={updateSelectedFeatures}
          metadata={metadata}
          userRole={userData?.role}
          openFeaturesDialog={openFeaturesDialog}
          initialiseDigitising={initialiseDigitising}
          previewFeature={previewFeature}
          refreshFeatures={refreshFeatures}
          preview={true}
        />
        {featureState.dialogs.featureDialogOpen ? (
          <FeatureDialog getTilesetMetadata={getMetadata} />
        ) : null}
        <NewFeatureDialog
          loading={uiState.loading || uploading}
          newFeatureCreated={newFeatureCreated}
        />
        {featureState.dialogs.importFeaturesDialogOpen ? (
          <ImportFeaturesDialog
            importFeatures={importFeatures}
            fileUpload={uploadFileToFolder}
            unzipShapefile={unzipShapefile}
            getShapefileFieldnames={getShapefileFieldnames}
            deleteShapefile={deleteShapefile}
          />
        ) : null}
        <PlanningGridsDialog
          loading={uiState.loading}
          unauthorisedMethods={unauthorisedMethods}
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
        {dialogStates.costsDialogOpen ? (
          <CostsDialog
            unauthorisedMethods={unauthorisedMethods}
            costname={metadata?.COSTS}
            deleteCost={deleteCost}
            createCostsFromImpact={createCostsFromImpact}
          />
        ) : null}
        <ImportCostsDialog
          addCost={addCost}
          deleteCostFileThenClose={deleteCostFileThenClose}
          fileUpload={uploadFileToProject}
        />
        <RunSettingsDialog
          updateRunParams={updateRunParams}
          runParams={runParams}
          userRole={userData?.role}
        />
        {dialogStates.classificationDialogOpen ? (
          <ClassificationDialog
            open={dialogStates.classificationDialogOpen}
            onOk={() => setClassificationDialogOpen(false)}
            onCancel={() => setClassificationDialogOpen(false)}
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
        <ResetDialog onOk={resetServer} />
        {/* <RunLogDialog
            preprocessing={preprocessing}
            unauthorisedMethods={unauthorisedMethods}
            runLogs={runLogs}
            getRunLogs={getRunLogs}
            clearRunLogs={clearRunLogs}
            stopMarxan={stopProcess}
            userRole={userData?.role}
            runlogTimer={runlogTimer}
          /> */}
        <ServerDetailsDialog loading={uiState.loading} />
        <AlertDialog />
        <FeatureMenu
          anchorEl={menuAnchor}
          removeFromProject={removeFromProject}
          toggleFeatureLayer={toggleFeatureLayer}
          toggleFeaturePUIDLayer={toggleFeaturePUIDLayer}
          zoomToFeature={zoomToFeature}
          preprocessSingleFeature={preprocessSingleFeature}
          preprocessing={preprocessing}
        />
        <TargetDialog
          showCancelButton={true}
          updateTargetValueForFeatures={updateTargetValueForFeatures}
        />
        {dialogStates.atlasLayersDialogOpen ? (
          <AtlasLayersDialog map={map} atlasLayers={atlasLayers} />
        ) : null}

        {dialogStates.cumulativeImpactDialogOpen ? (
          <CumulativeImpactDialog
            loading={uiState.loading || uploading}
            _get={_get}
            metadata={metadata}
            clickImpact={clickImpact}
            initialiseDigitising={initialiseDigitising}
            selectedImpactIds={selectedImpactIds}
            userRole={userData?.role}
          />
        ) : null}

        {dialogStates.humanActivitiesDialogOpen ? (
          <HumanActivitiesDialog
            loading={uiState.loading || uploading}
            metadata={metadata}
            initialiseDigitising={initialiseDigitising}
            userRole={userData?.role}
            fileUpload={uploadRaster}
            saveActivityToDb={saveActivityToDb}
            startLogging={startLogging}
            handleWebSocket={handleWebSocket}
          />
        ) : null}

        <RunCumuluativeImpactDialog
          loading={uiState.loading || uploading}
          metadata={metadata}
          userRole={userData?.role}
          runCumulativeImpact={runCumulativeImpact}
        />
        <MenuBar
          open={isLoggedIn}
          openFeaturesDialog={openFeaturesDialog}
          openProjectsDialog={openProjectsDialog}
          openPlanningGridsDialog={openPlanningGridsDialog}
          openCumulativeImpactDialog={openCumulativeImpactDialog}
          openAtlasLayersDialog={openAtlasLayersDialog}
          setMenuAnchor={setMenuAnchor}
        />
      </React.Fragment>
    </div>
  );
};

export default App;

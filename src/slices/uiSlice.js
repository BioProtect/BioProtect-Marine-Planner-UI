import { createSlice, current } from "@reduxjs/toolkit";

const mapboxBasemaps = [
  {
    name: "Charted",
    alias: "ESRI Charted Territory",
    description: "Oooo lovely",
    id: "https://www.arcgis.com/sharing/rest/content/items/1c365daf37a744fbad748b67aa69dac8/resources/styles/root.json",
    provider: "esri",
  },
  {
    name: "Topographic",
    alias: "ESRI Topographic",
    description: "Oooo lovely",
    id: "https://www.arcgis.com/sharing/rest/content/items/0f52cd2d17ea4773944a1d0e0fb99ea4/resources/styles/root.json",
    provider: "esri",
  },
  {
    name: "Streets",
    alias: "Mapbox Streets",
    description:
      "A complete basemap, perfect for incorporating your own data.",
    id: "mapbox/streets-v10",
    provider: "mapbox",
  },
  {
    name: "Outdoors",
    alias: "Mapbox Outdoors",
    description: "General basemap tailored to hiking, biking and sport.",
    id: "mapbox/outdoors-v10",
    provider: "mapbox",
  },
  {
    name: "Dark",
    alias: "Mapbox Dark",
    description: "Subtle dark backdrop for data visualizations.",
    id: "mapbox/dark-v9",
    provider: "mapbox",
  },
  {
    name: "Light",
    alias: "Mapbox Light",
    description: "Subtle light backdrop for data visualizations.",
    id: "mapbox/light-v9",
    provider: "mapbox",
  },
  {
    name: "Satellite",
    alias: "Mapbox Satellite",
    description: "A beautiful global satellite and aerial imagery layer.",
    id: "mapbox/satellite-v9",
    provider: "mapbox",
  },
  {
    name: "Satellite Streets",
    alias: "Mapbox Satellite Streets",
    description: "Global imagery enhanced with road and label hierarchy.",
    id: "mapbox/satellite-streets-v9",
    provider: "mapbox",
  },
  {
    name: "Blank",
    alias: "Blank background",
    description: "Plain white background",
    id: "",
    provider: "local",
  },
  {
    name: "BioProtect",
    alias: "BioProtect",
    description: "BioProtect basemap",
    id: "craicerjack/cm4co2ve7000l01pfchhs2vv8",
    provider: "mapbox",
  },
  {
    name: "OSM",
    alias: "Open Street Map",
    description: "Open Street Map",
    id: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    provider: "local",
  },
];

const initialState = {
  loading: false,
  activeTab: "project",
  activeResultsTab: "legend",
  basemap: "BioProtect",
  basemaps: mapboxBasemaps,
  registry: {},

  activities: [],
  allImpacts: [],
  uploadedActivities: [],
  selectedActivity: "",

  owner: "",

  fileUploadResponse: null,

  dialogStates: {
    aboutDialogOpen: false,

    activitiesDialogOpen: false,
    cumulativeImpactDialogOpen: false,
    humanActivitiesDialogOpen: false,
    importedActivitiesDialogOpen: false,
    openImportImpactsDialog: false,


    alertDialogOpen: false,
    atlasLayersDialogOpen: false,
    classificationDialogOpen: false,
    costsDialogOpen: false,
    importCostsDialogOpen: false,
    helpMenuOpen: false,
    importImpactPopoverOpen: false,
    importFromWebDialogOpen: false,
    infoPanelOpen: false,
    profileDialogOpen: false,
    registerDialogOpen: false,
    resendPasswordDialogOpen: false,
    changePasswordDialogOpen: false,

    resetDialogOpen: false,
    resultsPanelOpen: false,
    runLogDialogOpen: false,
    serverDetailsDialogOpen: false,
    settingsDialogOpen: false,
    shareableLinkDialogOpen: false,
    targetDialogOpen: false,
    updateWDPADialogOpen: false,
    usersDialogOpen: false,
    userMenuOpen: false,
    userSettingsDialogOpen: false,
    welcomeDialogOpen: false,
    toolsMenuOpen: false,
  },

  importLog: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setBasemap(state, action) {
      state.basemap = action.payload;
    },
    setBasemaps(state, action) {
      state.basemaps = action.payload;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setActiveResultsTab(state, action) {
      state.activeResultsTab = action.payload;
    },
    toggleDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.dialogStates[dialogName] = isOpen;
    },
    setActivities(state, action) {
      state.activities = action.payload;
    },
    setUploadedActivities(state, action) {
      state.uploadedActivities = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setOwner(state, action) {
      state.owner = action.payload;
    },

    setSelectedActivity(state, action) {
      state.selectedActivity = action.payload;
    },
    setFileUploadResponse(state, action) {
      state.fileUploadResponse = action.payload;
    },
    setRegistry(state, action) {
      state.registry = action.payload;
    },
    addToImportLog: (state, action) => {
      state.importLog.push(action.payload);
    },
    removeImportLogMessage: (state, action) => {
      const matchText = action.payload;
      state.importLog = state.importLog.filter((msg) =>
        typeof msg === "string"
          ? !msg.includes(matchText)
          : !(msg.info && msg.info.includes(matchText))
      );
    },
    clearImportLog: (state) => {
      state.importLog = [];
    }


  },
});

export const {
  setBasemap,
  setBasemaps,
  setActiveTab,
  setActiveResultsTab,
  toggleProjectDialog,
  toggleDialog,
  setActivities,
  setUploadedActivities,
  setLoading,
  setSelectedActivity,
  setRegistry,
  setFileUploadResponse,
  addToImportLog,
  removeImportLogMessage,
  clearImportLog,
  setOwner,
} = uiSlice.actions;
export default uiSlice.reducer;

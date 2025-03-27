import { createSlice, current } from "@reduxjs/toolkit";

import UserMenu from "../User/UserMenu";

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
];

const initialState = {
  snackbarOpen: false,
  snackbarMessage: "",
  activeTab: "project",
  activeResultsTab: "legend",
  basemap: "Light",
  basemaps: mapboxBasemaps,

  dialogStates: {
    aboutDialogOpen: false,
    activitiesDialogOpen: false,
    alertDialogOpen: false,
    atlasLayersDialogOpen: false,
    changePasswordDialogOpen: false,
    classificationDialogOpen: false,
    clumpingDialogOpen: false,
    costsDialogOpen: false,
    importCostsDialogOpen: false,
    cumulativeImpactDialogOpen: false,
    gapAnalysisDialogOpen: false,
    helpMenuOpen: false,
    humanActivitiesDialogOpen: false,
    importedActivitiesDialogOpen: false,
    importImpactPopoverOpen: false,
    importFromWebDialogOpen: false,
    infoPanelOpen: false,
    openImportImpactsDialog: false,
    profileDialogOpen: false,
    registerDialogOpen: false,
    resendPasswordDialogOpen: false,
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
    setSnackbarOpen(state, action) {
      state.snackbarOpen = action.payload;
    },
    setSnackbarMessage(state, action) {
      state.snackbarMessage = action.payload;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setActiveResultsTab(state, action) {
      state.activeResultsTab = action.payload;
    },
    setIdentifyFeatures(state, action) {
      state.identifiedFeatures = action.payload;
    },
    setSelectedFeatureIds(state, action) {
      state.selectedFeatureIds = action.payload;
    },
    setFeatureDatasetFilename(state, action) {
      state.featureDatasetFilename = action.payload;
    },
    toggleDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.dialogStates[dialogName] = isOpen;
    },
  },
});

export const {
  setBasemap,
  setBasemaps,
  setSnackbarOpen,
  setSnackbarMessage,
  setActiveTab,
  setActiveResultsTab,
  setIdentifyFeatures,
  setSelectedFeatureIds,
  setFeatureDatasetFilename,
  toggleProjectDialog,
  togglePUD,
  toggleDialog,
} = uiSlice.actions;
export default uiSlice.reducer;

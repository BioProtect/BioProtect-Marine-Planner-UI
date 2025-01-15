import { createSlice, current } from "@reduxjs/toolkit";

import UserMenu from "../User/UserMenu";

const initialState = {
  snackbarOpen: false,
  snackbarMessage: "",
  activeTab: "project",
  activeResultsTab: "legend",

  addingRemovingFeatures: false,
  allFeatures: [],
  currentFeature: {},
  featureMetadata: {},
  identifiedFeatures: [],
  selectedFselectedFeatureIds: [],
  featureDatasetFilename: "",


  projectDialogStates: {
    projectsListDialogOpen: false,
    newProjectDialogOpen: false,
    projectsDialogOpen: false,
    newProjectWizardDialogOpen: false,
  },
  featureDialogStates: {
    newFeatureDialogOpen: false,
    featureDialogOpen: false,
    featuresDialogOpen: false,
    featuresDialogOpen: false,
    importFeaturePopoverOpen: false,
    importFeaturesDialogOpen: false,
    newFeaturePopoverOpen: false,
    featureInfoDialogOpen: false,
    featureMenuOpen: false,
  },
  planningGridDialogStates: {
    newMarinePlanningGridDialogOpen: false,
    newPlanningGridDialogOpen: false,
    importPlanningGridDialogOpen: false,
    planningGridDialogOpen: false,
    planningGridsDialogOpen: false,
  },
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
    setAddingRemovingFeatures(state, action) {
      state.addingRemovingFeatures = action.payload;
    },
    setAllFeatures(state, action) {
      state.allFeatures = action.payload;
    },
    setCurrentFeature(state, action) {
      state.currentFeature = action.payload;
    },
    setFeatureMetadata(state, action) {
      state.featureMetadata = action.payload;
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
    toggleProjectDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.projectDialogStates[dialogName] = isOpen;
    },
    toggleFeatureDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.featureDialogStates[dialogName] = isOpen;
    },
    togglePlanningGridDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.planningGridDialogStates[dialogName] = isOpen;
    },
    toggleDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.dialogStates[dialogName] = isOpen;
    },
  },
});

export const {
  setSnackbarOpen,
  setSnackbarMessage,
  setActiveTab,
  setActiveResultsTab,
  setAddingRemovingFeatures,
  setAllFeatures,
  setCurrentFeature,
  setFeatureMetadata,
  setIdentifyFeatures,
  setSelectedFeatureIds,
  setFeatureDatasetFilename,
  toggleProjectDialog,
  toggleFeatureDialog,
  togglePlanningGridDialog,
  toggleDialog,
} = uiSlice.actions;
export default uiSlice.reducer;

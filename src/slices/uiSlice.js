import { createSlice, current } from "@reduxjs/toolkit";

import UserMenu from "../User/UserMenu";

const initialState = {
  snackbarOpen: false,
  snackbarMessage: "",
  activeTab: "project",
  activeResultsTab: "legend",

  projectDialogStates: {
    projectsListDialogOpen: false,
    newProjectDialogOpen: false,
    projectsDialogOpen: false,
    newProjectWizardDialogOpen: false,
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
  setIdentifyFeatures,
  setSelectedFeatureIds,
  setFeatureDatasetFilename,
  toggleProjectDialog,
  togglePlanningGridDialog,
  toggleDialog,
} = uiSlice.actions;
export default uiSlice.reducer;

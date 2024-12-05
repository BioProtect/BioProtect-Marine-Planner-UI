import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  snackbarOpen: false,
  snackbarMessage: "",
  activeTab: "",
  activeResultsTab: "legend",
  projectDialogStates: {
    projectsListDialogOpen: false,
    importProjectDialogOpen: false,
    importProjectPopoverOpen: false,
    newProjectDialogOpen: false,
    projectsDialogOpen: false,
    importFromWebDialogOpen: false,
    importGBIFDialogOpen: false,
    importMXWDialogOpen: false,
  },
  featureDialogStates: {
    newFeatureDialogOpen: false,
    featureDialogOpen: false,
    featuresDialogOpen: false,
    importFeaturePopoverOpen: false,
  },
  planningGridDialogStates: {
    newMarinePlanningGridDialogOpen: false,
    newPlanningGridDialogOpen: false,
    importPlanningGridDialogOpen: false,
    planningGridDialogOpen: false,
    planningGridsDialogOpen: false,
  },
  importDialogStates: {},
  dialogStates: {
    aboutDialogOpen: false,
    activitiesDialogOpen: false,
    alertDialogOpen: false,
    atlasLayersDialogOpen: false,
    changePasswordDialogOpen: false,
    classificationDialogOpen: false,
    clumpingDialogOpen: false,
    costsDialogOpen: false,
    cumulativeImpactDialogOpen: false,
    gapAnalysisDialogOpen: false,
    humanActivitiesDialogOpen: false,
    importedActivitiesDialogOpen: false,
    importImpactPopoverOpen: false,
    infoPanelOpen: false,
    openInfoDialogOpen: false,
    openImportImpactsDialog: false,
    profileDialogOpen: false,
    registerDialogOpen: false,
    resendPasswordDialogOpen: false,
    resetDialogOpen: false,
    runLogDialogOpen: false,
    serverDetailsDialogOpen: false,
    settingsDialogOpen: false,
    shareableLinkDialogOpen: false,
    targetDialogOpen: false,
    updateWDPADialogOpen: false,
    usersDialogOpen: false,
    userSettingsDialogOpen: false,
    welcomeDialogOpen: false,
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
    toggleImportDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.importDialogStates[dialogName] = isOpen;
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
  toggleProjectDialog,
  toggleFeatureDialog,
  togglePlanningGridDialog,
  toggleImportDialog,
  toggleDialog,
} = uiSlice.actions;
export default uiSlice.reducer;

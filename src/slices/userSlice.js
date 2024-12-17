import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  snackbarOpen: false,
  snackbarMessage: "",
  activeTab: "project",
  activeResultsTab: "legend",
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
  toggleDialog,
} = uiSlice.actions;
export default uiSlice.reducer;

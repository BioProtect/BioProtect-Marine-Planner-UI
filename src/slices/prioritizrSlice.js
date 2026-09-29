// slices/prioritizrSlice.js
import { createSlice } from "@reduxjs/toolkit";

const prioritizrSlice = createSlice({
  name: "prioritizr",
  initialState: {
    selectedRunIds: [],
  },
  reducers: {
    toggleRun(state, action) {
      const runId = action.payload;
      const idx = state.selectedRunIds.indexOf(runId);
      if (idx === -1) {
        state.selectedRunIds.push(runId);
      } else {
        state.selectedRunIds.splice(idx, 1);
      }
    },
    setSelectedRuns(state, action) {
      state.selectedRunIds = action.payload;
    },
    clearRuns(state) {
      state.selectedRunIds = [];
    },
  },
});

export const { toggleRun, setSelectedRuns, clearRuns } =
  prioritizrSlice.actions;
export default prioritizrSlice.reducer;

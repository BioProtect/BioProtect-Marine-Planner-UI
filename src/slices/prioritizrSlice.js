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
    clearRuns(state) {
      state.selectedRunIds = [];
    },
  },
});

export const { toggleRun, clearRuns } = prioritizrSlice.actions;
export default prioritizrSlice.reducer;

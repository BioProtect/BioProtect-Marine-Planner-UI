// slices/prioritizrSlice.js
import { createSlice } from "@reduxjs/toolkit";

const prioritizrSlice = createSlice({
  name: "prioritizr",
  initialState: {
    selectedRunId: null,
  },
  reducers: {
    selectRun(state, action) {
      state.selectedRunId = action.payload;
    },
    clearRun(state) {
      state.selectedRunId = null;
    },
  },
});

export const { selectRun, clearRun } = prioritizrSlice.actions;
export default prioritizrSlice.reducer;

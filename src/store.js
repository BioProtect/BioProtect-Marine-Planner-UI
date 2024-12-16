import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/projectSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    project: projectReducer,
  },
});

export default store;

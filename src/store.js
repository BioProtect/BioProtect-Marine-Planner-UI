import { apiSlice } from "./slices/apiSlice";
import authReducer from "./slices/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/projectSlice";
import uiReducer from "./slices/uiSlice";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    project: projectReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;

import { apiSlice } from "@slices/apiSlice";
import authReducer from "@slices/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import { featureApiSlice } from "@slices/featureSlice";
import featureReducer from "@slices/featureSlice"
import { planningUnitApiSlice } from "@slices/planningUnitSlice";
import planningUnitReducer from "@slices/planningUnitSlice"; // Import the slice reducer
import prioritizrReducer from "@slices/prioritizrSlice";
import { projectApiSlice } from "@slices/projectSlice";
import projectReducer from "@slices/projectSlice";
import uiReducer from "@slices/uiSlice";
import { userApiSlice } from "@slices/userSlice";
import userReducer from "@slices/userSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    feature: featureReducer,
    planningUnit: planningUnitReducer,
    project: projectReducer,
    ui: uiReducer,
    user: userReducer,
    prioritizr: prioritizrReducer,

    [featureApiSlice.reducerPath]: featureApiSlice.reducer,
    [planningUnitApiSlice.reducerPath]: planningUnitApiSlice.reducer,
    [projectApiSlice.reducerPath]: projectApiSlice.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;

import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@slices/apiSlice'
import authReducer from '@slices/authSlice'
import featureReducer, { featureApiSlice } from '@slices/featureSlice'
import planningUnitReducer, { planningUnitApiSlice } from '@slices/planningUnitSlice'
import prioritizrReducer from '@slices/prioritizrSlice'
import projectReducer, { projectApiSlice } from '@slices/projectSlice'
import uiReducer from '@slices/uiSlice'
import userReducer, { userApiSlice } from '@slices/userSlice'

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
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
})

export default store

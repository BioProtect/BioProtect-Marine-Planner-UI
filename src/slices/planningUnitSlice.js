import { apiSlice } from "./apiSlice";
import { createSlice } from "@reduxjs/toolkit";

export const planningUnitApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeature: builder.query({
      query: (id) => ({
        url: `features?action=get&unique_id=${id}`,
        method: "GET",
      }),
    }),
    deleteFeature: builder.mutation({
      query: (featureName) => ({
        url: `features?action=delete&feature_name=${featureName}`,
        method: "GET",
      }),
    }),
    exportFeature: builder.query({
      query: () => ({
        url: "features?action=export",
        method: "GET",
      }),
    }),
    listFeatureProjects: builder.query({
      query: (featureId) => ({
        url: `features?action=list_projects&feature_class_id=${featureId}`,
        method: "GET",
      }),
    }),
    listFeaturePUs: builder.query({
      query: (user, project, featureId) => ({
        url: `features?action=planning_units&user=${user}&project=${project}&unique_id=${featureId}`,
        method: "GET",
      }),
    }),

    createFeatureFromLinestring: builder.mutation({
      query: ({ id, data }) => ({
        url: `features?action=create_from_linestring`,
        method: "POST",
        body: { id, ...data },
      }),
    }),

  }),
})

export const {
  useGetFeatureQuery,
  useDeleteFeatureQuery,
  useExportFeatureQuery,
  useListFeatureProjectsQuery,
  useListFeaturePUsQuery,
  useCreateFeatureFromLinestringMutation,
} = planningUnitApiSlice;



// Thunk to handle server initialization
const planningUnitSlice = createSlice({
  name: "planning-unit",
  initialState: {
    identifyPlanningUnits: {},
    planningUnitGrids: [],
    planningUnits: [],
    puEditing: false,

    dialogs: {

    },
  },
  reducers: {
    setIdentifyPlanningUnits(state, action) {
      state.identifyPlanningUnits = action.payload;
    },
    setPlanningUnitGrids(state, action) {
      state.planningUnitGrids = action.payload;
    },
    setPlanningUnits(state, action) {
      state.planningUnits = action.payload;
    },
    setPuEditing(state, action) {
      state.featureMetadata = action.payload;
    },
    setIdentifiedFeatures(state, action) {
      state.identifiedFeatures = action.payload;
    },
    setSelectedFeatureIds(state, action) {
      state.selectedFeatureIds = action.payload;
    },
    setFeatureDatasetFilename(state, action) {
      state.featureDatasetFilename = action.payload;
    },
    togglePUD(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.dialogs[dialogName] = isOpen;
    }
  }
});

export const {
  setIdentifyPlanningUnits,
  setPlanningUnitGrids,
  setPlanningUnits,
  setPuEditing,

  setIdentifiedFeatures,
  setSelectedFeatureIds,
  setFeatureDatasetFilename,
  togglePUD,
} = planningUnitSlice.actions;
export default planningUnitSlice.reducer;

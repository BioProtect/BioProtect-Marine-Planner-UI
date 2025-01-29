import { apiSlice } from "./apiSlice";
import { createSlice } from "@reduxjs/toolkit";

export const featureApiSlice = apiSlice.injectEndpoints({
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
} = featureApiSlice;



// Thunk to handle server initialization
const featureSlice = createSlice({
  name: "feature",
  initialState: {
    addingRemovingFeatures: false,
    allFeatures: [], //all of the interest features in the metadata_interest_features table
    currentFeature: {},
    featureMetadata: {},
    identifiedFeatures: [],
    selectedFeature: {},
    selectedFeatureIds: [],
    featureDatasetFilename: "",
    featureProjects: [],
    featurePlanningUnits: [],
    createdFeatureInfo: {},
    dialogs: {
      newFeatureDialogOpen: false,
      featureDialogOpen: false,
      featuresDialogOpen: false,
      importFeaturePopoverOpen: false,
      importFeaturesDialogOpen: false,
      newFeaturePopoverOpen: false,
      featureInfoDialogOpen: false,
      featureMenuOpen: false,
    },
  },
  reducers: {
    setAddingRemovingFeatures(state, action) {
      state.addingRemovingFeatures = action.payload;
    },
    setAllFeatures(state, action) {
      state.allFeatures = action.payload;
    },
    setCurrentFeature(state, action) {
      state.currentFeature = action.payload;
    },
    setFeatureMetadata(state, action) {
      state.featureMetadata = action.payload;
    },
    setIdentifiedFeatures(state, action) {
      state.identifiedFeatures = action.payload;
    },
    setSelectedFeature(state, action) {
      state.selectedFeature = action.payload;
    },
    setSelectedFeatureIds(state, action) {
      state.selectedFeatureIds = action.payload;
    },
    setFeatureDatasetFilename(state, action) {
      state.featureDatasetFilename = action.payload;
    },
    setFeatureProjects(state, action) {
      state.featureProjects = action.payload;
    },
    setCreatedFeatureInfo(state, action) {
      state.createdFeatureInfo = action.payload;
    },
    setFeaturePlanningUnits(state, action) {
      state.featurePlanningUnits = action.payload;
    },
    toggleFeatureD(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.dialogs[dialogName] = isOpen;
    }
  }
});

export const {
  setAddingRemovingFeatures,
  setAllFeatures,
  setCurrentFeature,
  setFeatureMetadata,
  setFeatureProjects,
  setIdentifiedFeatures,
  setSelectedFeature,
  setSelectedFeatureIds,
  setFeatureDatasetFilename,
  setCreatedFeatureInfo,
  setFeaturePlanningUnits,
  toggleFeatureD,
} = featureSlice.actions;
export default featureSlice.reducer;

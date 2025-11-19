import ImportFromWebDialog from "../ImportComponents/ImportFromWebDialog";
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
    getAllFeatures: builder.query({
      query: () => ({
        url: `features?action=get-all`,
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
        url: `features?action=list-projects&feature_class_id=${featureId}`,
        method: "GET",
      }),
    }),
    listFeaturePUs: builder.query({
      query: (user, project, featureId) => ({
        url: `features?action=planning-units&user=${user}&project=${project}&unique_id=${featureId}`,
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

    getSensitivities: builder.mutation({
      query: () => ({
        url: `features?action=get-sensitivities`,
        method: "GET",
      }),
    }),

  }),
})

export const {
  useGetFeatureQuery,
  useGetAllFeaturesQuery,
  useDeleteFeatureMutation,
  useExportFeatureQuery,
  useListFeatureProjectsQuery,
  useListFeaturePUsQuery,
  useCreateFeatureFromLinestringMutation,
  useGetSensitivitiesMutation
} = featureApiSlice;


const initialState = {
  digitisedFeatures: [],
  addingRemovingFeatures: false,
  allFeatures: [], //all of the interest features in the metadata_interest_features table
  currentFeature: {},
  featureMetadata: {},
  identifiedFeatures: [],
  selectedFeature: {},
  selectedFeatureIds: [],
  featureFilename: "",
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
    importFromWebDialogOpen: false
  },

}

// Thunk to handle server initialization
const featureSlice = createSlice({
  name: "feature",
  initialState,
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
    setFeatureFilename(state, action) {
      state.featureFilename = action.payload;
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
    setDigitisedFeatures(state, action) {
      state.digitisedFeatures = action.payload;
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
  setFeatureFilename,
  setCreatedFeatureInfo,
  setFeaturePlanningUnits,
  toggleFeatureD,
  setDigitisedFeatures,
} = featureSlice.actions;
export default featureSlice.reducer;

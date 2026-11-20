import { createSlice } from '@reduxjs/toolkit'
import { apiSlice } from './apiSlice'

export const featureApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getFeature: builder.query({
      query: id => ({
        url: `features?action=get&id=${id}`,
        method: 'GET',
      }),
      providesTags: (result, err, id) => [
        { type: 'Features', id },
      ],
    }),
    getAllFeatures: builder.query({
      query: () => ({
        url: `features?action=get-all`,
        method: 'GET',
      }),
      providesTags: () => [
        { type: 'Features', id: 'LIST' },
      ],
    }),
    deleteFeature: builder.mutation({
      query: featureName => ({
        url: `features?action=delete&feature=${featureName}`,
        method: 'GET',
      }),
      invalidatesTags: [
        { type: 'Features', id: 'LIST' },
      ],
    }),
    exportFeature: builder.query({
      query: () => ({
        url: 'features?action=export',
        method: 'GET',
      }),
    }),
    listFeatureProjects: builder.query({
      query: featureId => ({
        url: `features?action=list-projects&feature-id=${featureId}`,
        method: 'GET',
      }),
    }),
    listFeaturePUs: builder.query({
      query: ({ projectId, featureId }) => ({
        url: `features?action=planning-units&project_id=${projectId}&id=${featureId}`,
        method: 'GET',
      }),
    }),

    // body: { name, description, geojson }; the server cuts out land
    createFeatureFromDrawing: builder.mutation({
      query: body => ({
        url: `features?action=create-from-drawing`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Features', id: 'LIST' },
      ],
    }),

    getSensitivities: builder.mutation({
      query: () => ({
        url: `features?action=get-sensitivities`,
        method: 'GET',
      }),
    }),

  }),
})

export const {
  useGetAllFeaturesQuery,
  useDeleteFeatureMutation,
  useListFeatureProjectsQuery,
  useListFeaturePUsQuery,
  useGetSensitivitiesMutation,
  useCreateFeatureFromDrawingMutation,
} = featureApiSlice

const initialState = {
  // selection should be ids, not whole objects
  selectedFeatureId: null,
  selectedFeatureIds: [],

  // uploads / UI
  featureFilename: '',
  createdFeatureInfo: {},

  // { [featureId]: partialUpdates }
  overridesById: {},

  featurePlanningUnits: [],

  featureMetadata: {},

  dialogs: {
    featureDialogOpen: false,
    featuresDialogOpen: false,
    importFeaturesDialogOpen: false,
    featureInfoDialogOpen: false,
    featureMenuOpen: false,
  },

}

// Thunk to handle server initialization
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setSelectedFeatureId(state, action) {
      state.selectedFeatureId = action.payload
    },
    setSelectedFeatureIds(state, action) {
      state.selectedFeatureIds = action.payload
    },
    setFeatureFilename(state, action) {
      state.featureFilename = action.payload
    },
    setCreatedFeatureInfo(state, action) {
      state.createdFeatureInfo = action.payload
    },
    setFeaturePlanningUnits(state, action) {
      state.featurePlanningUnits = action.payload
    },
    setFeatureMetadata(state, action) {
      state.featureMetadata = action.payload
    },
    toggleFeatureD(state, action) {
      const { dialogName, isOpen } = action.payload
      state.dialogs[dialogName] = isOpen
    },
  },
})

export const {
  setSelectedFeatureId,
  setSelectedFeatureIds,
  setFeatureFilename,
  setFeaturePlanningUnits,
  setFeatureMetadata,
  toggleFeatureD,
} = featureSlice.actions
export default featureSlice.reducer

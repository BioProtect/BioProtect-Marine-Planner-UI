import { createSlice } from '@reduxjs/toolkit'

import { apiSlice } from './apiSlice'

export const planningUnitApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    deletePlanningUnitGrid: builder.mutation({
      query: featureName => ({
        url: `planning-units?action=delete&planning_grid_name=${featureName}`,
        method: 'GET',
      }),
      invalidatesTags: ['PlanningUnitGrids'],
    }),
    exportPlanningUnitGrid: builder.query({
      query: featureName => ({
        url: `planning-units?action=export&name=${featureName}`,
        method: 'GET',
      }),
    }),
    // Area of an uploaded shapefile or drawn area, for suggesting a resolution
    estimateGridArea: builder.mutation({
      query: source => ({
        url: `planning-units?action=estimate`,
        method: 'POST',
        body: source,
      }),
      transformResponse: raw =>
        typeof raw === 'string'
          ? JSON.parse(raw)
          : raw,
    }),
    listPlanningUnitGrids: builder.query({
      query: () => ({
        url: `planning-units?action=list`,
        method: 'GET',
      }),
      providesTags: ['PlanningUnitGrids'],
    }),
  }),
})

export const {
  useDeletePlanningUnitGridMutation,
  useEstimateGridAreaMutation,
  useListPlanningUnitGridsQuery,
} = planningUnitApiSlice

const initialState = {
  identifyPlanningUnits: {},
  planningUnitGrids: [],
  planningUnits: [],
  currentPUGrid: '',
  showPlanningGrid: true,

  dialogs: {
    planningGridDialogOpen: false,
    planningGridsDialogOpen: false,
    hexInfoDialogOpen: false,
  },
}

// Thunk to handle server initialization
const planningUnitSlice = createSlice({
  name: 'planningUnit',
  initialState,
  reducers: {
    setIdentifyPlanningUnits(state, action) {
      state.identifyPlanningUnits = {
        ...(state.identifyPlanningUnits || {}),
        ...(action.payload || {}),
      }
    },

    setPlanningUnitGrids(state, action) {
      state.planningUnitGrids = action.payload
    },
    setPlanningUnits(state, action) {
      state.planningUnits = action.payload
    },
    setShowPlanningGrid(state, action) {
      state.showPlanningGrid = action.payload
    },
    togglePUD(state, action) {
      const { dialogName, isOpen } = action.payload
      state.dialogs[dialogName] = isOpen
    },
    setCurrentPUGrid(state, action) {
      state.currentPUGrid = action.payload
    },
  },
})

export const {
  setIdentifyPlanningUnits,
  setPlanningUnitGrids,
  setCurrentPUGrid,
  setShowPlanningGrid,
  togglePUD,
} = planningUnitSlice.actions
export default planningUnitSlice.reducer

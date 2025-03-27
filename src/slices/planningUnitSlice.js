import { apiSlice } from "./apiSlice";
import { createSlice } from "@reduxjs/toolkit";

export const planningUnitApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    deletePlanningUnit: builder.mutation({
      query: (featureName) => ({
        url: `planning-units?action=delete&feature_name=${featureName}`,
        method: "GET",
      }),
      invalidatesTags: ["PlanningUnits"],
    }),
    exportPlanningUnit: builder.query({
      query: (featureName) => ({
        url: `planning-units?action=export&name=${featureName}`,
        method: "GET",
      }),
    }),
    listPlanningUnits: builder.query({
      query: () => ({
        url: `planning-units?action=list`,
        method: "GET",
      }),
      providesTags: ["PlanningUnits"],
    }),
  }),
})

export const {
  useDeletePlanningUnitQuery,
  useExportPlanningUnitQuery,
  useListPlanningUnitsQuery,
} = planningUnitApiSlice;


const initialState = {
  identifyPlanningUnits: {},
  planningUnitGrids: [],
  planningUnits: [],
  puEditing: false,
  dialogs: {
    newMarinePlanningGridDialogOpen: false,
    newPlanningGridDialogOpen: false,
    importPlanningGridDialogOpen: false,
    planningGridDialogOpen: false,
    planningGridsDialogOpen: false,
  },
}

// Thunk to handle server initialization
const planningUnitSlice = createSlice({
  name: "planningUnit",
  initialState,
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
  togglePUD,
} = planningUnitSlice.actions;
export default planningUnitSlice.reducer;

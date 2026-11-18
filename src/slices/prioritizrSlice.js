// slices/prioritizrSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { setActiveProjectId } from './projectSlice'

const prioritizrSlice = createSlice({
  name: 'prioritizr',
  initialState: {
    selectedRunIds: [], // runs of the loaded project
    comparedRunIds: [], // runs of other projects, overlaid for comparison
    projectId: null, // the project both lists belong to
  },
  reducers: {
    toggleRun(state, action) {
      const runId = action.payload
      const idx = state.selectedRunIds.indexOf(runId)
      if (idx === -1) {
        state.selectedRunIds.push(runId)
      }
      else {
        state.selectedRunIds.splice(idx, 1)
      }
    },
    toggleComparedRun(state, action) {
      const runId = action.payload
      const idx = state.comparedRunIds.indexOf(runId)
      if (idx === -1)
        state.comparedRunIds.push(runId)
      else
        state.comparedRunIds.splice(idx, 1)
    },
    setSelectedRuns(state, action) {
      state.selectedRunIds = action.payload
    },
    clearRuns(state) {
      state.selectedRunIds = []
      state.comparedRunIds = []
    },
  },
  extraReducers: (builder) => {
    // run ids belong to a project: a different project starts empty, or the
    // old ids get drawn wherever their h3 indexes happen to match
    builder.addCase(setActiveProjectId, (state, action) => {
      if (action.payload !== state.projectId) {
        state.selectedRunIds = []
        state.comparedRunIds = []
      }
      state.projectId = action.payload
    })
  },
})

export const { toggleRun, toggleComparedRun, setSelectedRuns, clearRuns }
  = prioritizrSlice.actions
export default prioritizrSlice.reducer

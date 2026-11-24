// slices/prioritizrSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { setActiveProjectId } from './projectSlice'

const prioritizrSlice = createSlice({
  name: 'prioritizr',
  initialState: {
    selectedRunIds: [], // runs of the loaded project
    comparedRunIds: [], // runs of other projects, overlaid for comparison
    // other projects in the comparison ({ id, name }); one stays listed with no
    // run ticked, so its runs can be switched back on
    comparedProjects: [],
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
    addComparedProject(state, action) {
      if (!state.comparedProjects.some(p => p.id === action.payload.id))
        state.comparedProjects.push(action.payload)
    },
    // payload: { id, runIds } - the project's runs come off the map with it
    removeComparedProject(state, action) {
      const { id, runIds } = action.payload
      state.comparedProjects = state.comparedProjects.filter(p => p.id !== id)
      state.comparedRunIds = state.comparedRunIds.filter(r => !runIds.includes(r))
    },
    setSelectedRuns(state, action) {
      state.selectedRunIds = action.payload
    },
    clearRuns(state) {
      state.selectedRunIds = []
      state.comparedRunIds = []
      state.comparedProjects = []
    },
  },
  extraReducers: (builder) => {
    // run ids belong to a project: a different project starts empty, or the
    // old ids get drawn wherever their h3 indexes happen to match
    builder.addCase(setActiveProjectId, (state, action) => {
      if (action.payload !== state.projectId) {
        state.selectedRunIds = []
        state.comparedRunIds = []
        state.comparedProjects = []
      }
      state.projectId = action.payload
    })
  },
})

export const {
  toggleRun,
  toggleComparedRun,
  addComparedProject,
  removeComparedProject,
  setSelectedRuns,
  clearRuns,
} = prioritizrSlice.actions
export default prioritizrSlice.reducer

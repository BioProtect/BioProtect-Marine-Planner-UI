import { CONSTANTS, INITIAL_VARS } from "../bpVars";
import {
  addLocalServer,
  filterAndSortServers,
  getServerCapabilities,
} from "../Server/serverFunctions";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  bpServers: [],
  bpServer: {},
  newWDPAVersion: false,
  wdpaVectorTilesLayerName: "",
  registry: INITIAL_VARS,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  addToProject: true,
  project: null,
  projects: [],
  projectList: [],
  projectListDialogHeading: "",
  projectListDialogTitle: "",
  projectLoaded: false,
  projectImpacts: [],
  projectFeatures: [],
};

// Thunk to handle server initialization
export const initialiseServers = createAsyncThunk(
  "project/initialiseServers",
  async (servers, { dispatch, rejectWithValue }) => {
    try {
      const updatedServers = addLocalServer(servers);
      // Fetch capabilities for each server
      const allCapabilities = await Promise.all(
        updatedServers.map((server) => getServerCapabilities(server))
      );
      const filteredAndSortedServers = filterAndSortServers(allCapabilities);
      dispatch(setBpServers(filteredAndSortedServers)); // Dispatch the updated servers to the store
      return "ServerData retrieved";
    } catch (error) {
      console.error("Failed to initialise servers:", error);
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setBpServers(state, action) {
      state.bpServers = action.payload;
    },
    setBpServer(state, action) {
      state.bpServer = action.payload;
    },
    selectServer(state, action) {
      const server = action.payload;
      state.bpServer = server;

      // Check for new WDPA version
      state.newWDPAVersion =
        server.wdpa_version !== state.registry.WDPA.latest_version;

      // Set the WDPA vector tiles layer name based on server's WDPA version
      state.wdpaVectorTilesLayerName = server.wdpa_version;

      // Perform guest user check (additional logic like switching user may require a separate thunk)
      if (!server.offline && !server.corsEnabled && server.guestUserEnabled) {
        state.bpServer.isGuestUser = true;
      }
    },
    setAddToProject(state, action) {
      state.addToProject = action.payload;
    },
    setProject(state, action) {
      state.project = action.payload;
    },
    setProjectFeatures(state, action) {
      state.projectFeatures = action.payload;
    },
    setProjectImpacts(state, action) {
      state.projectImpacts = action.payload;
    },
    setProjectLoaded(state, action) {
      state.projectLoaded = action.payload;
    },
    setProjectListDialogHeading(state, action) {
      state.projectListDialogHeading = action.payload;
    },
    setProjectListDialogTitle(state, action) {
      state.projectListDialogTitle = action.payload;
    },
    setProjectList(state, action) {
      state.projectList = action.payload;
    },
    setProjects(state, action) {
      state.projects = action.payload;
    },
    extraReducers: (builder) => {
      builder
        .addCase(initialiseServers.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(initialiseServers.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.error = null;
        })
        .addCase(initialiseServers.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload || "Failed to initialise servers";
        });
    },
  });

export const {
  setBpServers,
  setBpServer,
  selectServer,
  setAddToProject,
  setProjectFeatures,
  setProjectImpacts,
  setProjectLoaded,
  setProjectListDialogHeading,
  setProjectListDialogTitle,
  setProjectList,
  setProjects,

} = projectSlice.actions;
export default projectSlice.reducer;

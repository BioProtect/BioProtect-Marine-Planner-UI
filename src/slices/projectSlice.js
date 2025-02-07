import {
  addLocalServer,
  filterAndSortServers,
  getServerCapabilities,
} from "../Server/serverFunctions";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { INITIAL_VARS } from "../bpVars";
import { apiSlice } from "./apiSlice";

export const projectApiSlice = apiSlice.injectEndpoints({
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    createProject: builder.mutation({
      query: (projectData) => ({
        url: 'projects?action=',
        method: 'POST',
        body: { ...projectData, action: 'create' },
      }),
      invalidatesTags: ['Project'],
    }),
    createImportProject: builder.mutation({
      query: (importData) => ({
        url: 'projects?action=',
        method: 'POST',
        body: { ...importData, action: 'create_import' },
      }),
      invalidatesTags: ['Project'],
    }),
    createProjectGroup: builder.mutation({
      query: (groupData) => ({
        url: 'projects?action=',
        method: 'POST',
        body: { ...groupData, action: 'create_group' },
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation({
      query: (updateData) => ({
        url: 'projects?action=',
        method: 'POST',
        body: { ...updateData, action: 'update' },
      }),
      invalidatesTags: ['Project'],
    }),
    getProject: builder.query({
      query: (user, projectId) => ({
        url: `projects?action=get&user=${user}&projectId=${projectId}`,
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),
    listProjects: builder.query({
      query: () => ({
        url: '?action=list',
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),
    listProjectsWithGrids: builder.query({
      query: () => ({
        url: 'projects?action=list_with_grids',
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),
    cloneProject: builder.mutation({
      query: (projectId) => ({
        url: `projects?action=clone&projectId=${projectId}`,
        method: 'GET',
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `projects?action=delete&projectId=${projectId}`,
        method: 'GET',
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProjectCluster: builder.mutation({
      query: (clusterId) => ({
        url: `projects?action=delete_cluster&clusterId=${clusterId}`,
        method: 'GET',
      }),
      invalidatesTags: ['Project'],
    }),
    renameProject: builder.mutation({
      query: ({ projectId, newName }) => ({
        url: `projects?action=rename&projectId=${projectId}&newName=${newName}`,
        method: 'GET',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useCreateImportProjectMutation,
  useCreateProjectGroupMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
  useListProjectsQuery,
  useListProjectsWithGridsQuery,
  useCloneProjectMutation,
  useDeleteProjectMutation,
  useDeleteProjectClusterMutation,
  useRenameProjectMutation,
} = projectApiSlice;


const initialState = {
  bpServers: [],
  bpServer: {},
  newWDPAVersion: false,
  wdpaVectorTilesLayerName: "",
  registry: INITIAL_VARS,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  addToProject: true,
  project: {},
  projects: [],
  projectList: [],
  projectListDialogHeading: "",
  projectListDialogTitle: "",
  projectLoaded: false,
  projectImpacts: [],
  projectFeatures: [],
  dialogs: {
    projectsListDialogOpen: false,
    newProjectDialogOpen: false,
    projectsDialogOpen: false,
    newProjectWizardDialogOpen: false,
  },
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


// Thunk to fetch the user's project only if not already in state
export const getUserProject = createAsyncThunk(
  "project/getUserProject",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      // Get user ID from state
      const userId = getState().auth.userId;
      console.log("userId ", userId);
      const project = getState().auth.project;
      if (!project) {
        return rejectWithValue("No project associated with user");
      }
      // Fetch from API
      // const response = await fetch(`/projects?action=get&user=${user}&projectId=${project.id}`);
      const response = await dispatch(
        projectApiSlice.endpoints.getProject.initiate({ user: userId, projectId: project.id })
      ).unwrap(); // Unwraps the promise
      console.log("response ", response);
      return response; // Assuming response has { project: { id, name, ... } }
    } catch (error) {
      console.error("Failed to fetch project:", error);
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
    setProject(state, action) {
      state.project = action.payload;
    },
    toggleProjDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.dialogs[dialogName] = isOpen;
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
        })
        .addCase(getUserProject.pending, (state) => {
          state.status = "loading";
        })
        .addCase(getUserProject.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.project = action.payload;
        })
        .addCase(getUserProject.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload || "Failed to load project";
        });
    },
  }
})


export const {
  setBpServers,
  setBpServer,
  selectServer,
  setAddToProject,
  setProject,
  setProjectFeatures,
  setProjectImpacts,
  setProjectLoaded,
  setProjectListDialogHeading,
  setProjectListDialogTitle,
  setProjectList,
  setProjects,
  toggleProjDialog

} = projectSlice.actions;
export default projectSlice.reducer;

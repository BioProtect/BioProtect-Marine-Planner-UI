import {
  addLocalServer,
  filterAndSortServers,
  getServerCapabilities,
} from "../Server/serverFunctions";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setActiveTab, setOwner } from "./uiSlice";

import { INITIAL_VARS } from "../bpVars";
import { apiSlice } from "./apiSlice";
import { setSelectedFeatureIds } from "./featureSlice"

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
      query: (projectId) => ({
        url: `projects?action=get&projectId=${projectId}`,
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
  addToProject: true,
  bpServers: [],
  bpServer: {},
  newWDPAVersion: false,
  wdpaVectorTilesLayerName: "",
  registry: INITIAL_VARS,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  costData: null,
  renderer: {},

  projectData: {},
  projects: [],
  projectList: [],
  projectListDialogHeading: "",
  projectListDialogTitle: "",
  projectChanged: false,
  projectImpacts: [],
  projectFeatures: [],
  projectPlanningUnits: [],
  projectCosts: [],
  planningCostsTrigger: false,

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
  "projects/getUserProject",
  async (projectId, { dispatch, rejectWithValue }) => {
    try {
      if (!projectId) {
        const allProjects = await dispatch(
          projectApiSlice.endpoints.listProjects.initiate()
        ).unwrap();

        const parsed = typeof allProjects === "string" ? JSON.parse(allProjects) : allProjects;
        const firstProject = parsed.projects?.[0];

        if (!firstProject) {
          enqueueSnackbar?.("No projects found for user", { variant: "warning" })
          return rejectWithValue("No projects found for user");
        }
        projectId = firstProject.id;
      }

      const data = await dispatch(
        projectApiSlice.endpoints.getProject.initiate(projectId)
      ).unwrap();

      const response = JSON.parse(data);
      console.log("🔥 Project Data:", response);

      // update store
      dispatch(setProjectData(response));
      dispatch(setRenderer(response.renderer));  // Add missing renderer update
      dispatch(setProjectCosts(response.costnames));
      dispatch(setProjectFeatures(response.features));
      dispatch(setOwner(response.project.user));
      dispatch(setProjectPlanningUnits(response.planning_units))
      dispatch(setActiveTab("project"));
      dispatch(setPlanningCostsTrigger(true));
      await new Promise((resolve) => setTimeout(resolve, 0));

      return response; // Assuming response has { project: { id, name, ... } }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      return rejectWithValue(error.message);
    }
  }
);

// projectSlice.js
const switchProject = createAsyncThunk(
  "project/switchProject",
  async (projectId, { dispatch }) => {
    const data = await dispatch(getUserProject(projectId)).unwrap();
    return data;
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
    setCostData(state, action) {
      state.costData = action.payload;
    },
    setFiles(state, action) {
      state.files = action.payload;
    },
    setProjectData(state, action) {
      state.projectData = action.payload;
    },
    setProjectFeatures(state, action) {
      state.projectFeatures = action.payload;
    },
    setProjectImpacts(state, action) {
      state.projectImpacts = action.payload;
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
    setRenderer: (state, action) => {
      state.renderer = action.payload;
    },
    setProjectPlanningUnits: (state, action) => {
      state.projectPlanningUnits = action.payload;
    },
    setProjectCosts: (state, action) => {
      state.projectCosts = action.payload;
    },
    setPlanningCostsTrigger: (state, action) => {
      state.planningCostsTrigger = action.payload;
    },
    toggleProjDialog(state, action) {
      const { dialogName, isOpen } = action.payload;
      state.dialogs[dialogName] = isOpen;
    },
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
        state.projectData = action.payload;
      })
      .addCase(getUserProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load project";
      });
  },
})


export const {
  setBpServers,
  setBpServer,
  selectServer,
  setAddToProject,
  setCostData,
  setProjectData,
  setProjectFeatures,
  setProjectImpacts,
  setProjectListDialogHeading,
  setProjectListDialogTitle,
  setProjectList,
  setProjects,
  setRenderer,
  setProjectPlanningUnits,
  setProjectCosts,
  setPlanningCostsTrigger,
  toggleProjDialog,
} = projectSlice.actions;
export { switchProject };
export default projectSlice.reducer;

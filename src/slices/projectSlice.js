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
  endpoints: (builder) => ({
    // -----------------------------
    // CREATE PROJECT (JSON)
    // -----------------------------
    createProject: builder.mutation({
      query: (projectData) => ({
        url: "projects?action=create",
        method: "POST",
        body: projectData,
      }),
      invalidatesTags: [{ type: "ProjectList", id: "LIST" }],
    }),

    // -----------------------------
    // LEGACY: generic update (action=update)
    // Still uses backend update_project_parameters (file-based)
    // Not used for features.
    // -----------------------------
    updateProject: builder.mutation({
      query: ({ projectId, ...updateData }) => ({
        url: "projects?action=",
        method: "POST",
        body: { ...updateData, action: "update" },
      }),
      async onQueryStarted({ projectId, patch }, { dispatch, queryFulfilled }) {
        // patch = { features: [...] } or whatever you send
        const patchResult = dispatch(
          projectApiSlice.util.updateQueryData("getProject", projectId, (draft) => {
            // apply patch to draft
            if (patch.features) draft.features = patch.features;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (res, err, arg) => [{ type: "Project", id: arg.projectId }],
    }),

    // -----------------------------
    // UPDATE PROJECT FEATURES (JSON)
    // POST /projects?action=update_features
    // Body:
    // {
    //   project_id: number,
    //   interest_features: number[],
    //   target_values: number[],
    //   spf_values: number[]
    // }
    // -----------------------------
    updateProjectFeatures: builder.mutation({
      query: ({ projectId, features }) => {
        const getFeatureId = (f) => f.id ?? f.feature_unique_id;

        return {
          url: "projects?action=update_features",
          method: "POST",
          body: {
            project_id: projectId,
            interest_features: features.map((f) => getFeatureId(f)),
            target_values: features.map((f) => f.target_value),
            spf_values: features.map((f) => f.spf),
          },
        };
      },
      async onQueryStarted(
        { projectId, features },
        { dispatch, queryFulfilled },
      ) {
        // Optimistic update: keep UI responsive when editing features
        const patchResult = dispatch(
          projectApiSlice.util.updateQueryData(
            "getProject",
            projectId,
            (draft) => {
              draft.features = features;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Project", id: arg.projectId },
      ],
    }),

    // -----------------------------
    // GET SINGLE PROJECT
    // -----------------------------
    getProject: builder.query({
      query: (projectId) => ({
        url: `projects?action=get&projectId=${projectId}`,
        method: 'GET',
      }),
      transformResponse: (raw) => (typeof raw === "string" ? JSON.parse(raw) : raw),
      providesTags: (result, err, projectId) => [{ type: "Project", id: projectId }],
      async onQueryStarted(projectId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setOwner(data?.project?.user));
          dispatch(setActiveTab("project"));

          // sync feature selection from project → feature slice if needed
          const ids = (data?.features ?? []).map((f) => f.id);
          dispatch(setSelectedFeatureIds(ids));
        } catch {
          // ignore
        }
      },
    }),

    // -----------------------------
    // LIST PROJECTS
    // -----------------------------
    listProjects: builder.query({
      query: () => ({
        url: `projects?action=list`,
        method: "GET",
      }),
      providesTags: (result) => [{ type: "ProjectList", id: "LIST" }],
    }),

    // -----------------------------
    // CLONE PROJECT (not yet implemented backend)
    // -----------------------------
    cloneProject: builder.mutation({
      query: (projectId) => ({
        url: "projects?action=clone",
        method: "POST",
        body: { project_id: projectId },
      }),
      invalidatesTags: [{ type: "ProjectList", id: "LIST" }],
    }),


    // -----------------------------
    // DELETE PROJECT (JSON)
    // -----------------------------
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: "projects?action=delete",
        method: "POST",
        body: { project_id: projectId },
      }),
      invalidatesTags: [
        { type: "ProjectList", id: "LIST" },
        { type: "Project" },
      ],
    }),

    // -----------------------------
    // RENAME PROJECT (JSON)
    // -----------------------------
    renameProject: builder.mutation({
      query: ({ projectId, newName }) => ({
        url: "projects?action=rename",
        method: "POST",
        body: {
          project_id: projectId,
          newName,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Project", id: arg.projectId },
        { type: "ProjectList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useUpdateProjectFeaturesMutation,
  useGetProjectQuery,
  useListProjectsQuery,
  useCloneProjectMutation,
  useDeleteProjectMutation,
  useRenameProjectMutation,
} = projectApiSlice;


const initialState = {
  activeProjectId: null,
  addToProject: true,
  bpServers: [],
  bpServer: {},
  newWDPAVersion: false,
  wdpaVectorTilesLayerName: "",
  registry: INITIAL_VARS,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  costData: null,
  // renderer: {},

  projects: [],
  projectList: [],
  projectListDialogHeading: "",
  projectListDialogTitle: "",
  projectChanged: false,
  projectImpacts: [],
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
      const allCapabilities = await Promise.all(
        updatedServers.map((server) => getServerCapabilities(server))
      );
      const filteredAndSortedServers = filterAndSortServers(allCapabilities);
      dispatch(setBpServers(filteredAndSortedServers)); // Dispatch the updated servers to the store
      if (filteredAndSortedServers.length) {
        dispatch(selectServer(filteredAndSortedServers[0]));
      }
      return "ServerData retrieved";
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const bootstrapProject = createAsyncThunk(
  "projects/bootstrapProject",
  async (projectId, { dispatch, getState, rejectWithValue }) => {
    try {
      let projId = projectId;

      if (!projId) {
        const allProjects = await dispatch(
          projectApiSlice.endpoints.listProjects.initiate(undefined, { forceRefetch: true })
        ).unwrap();

        const parsed = typeof allProjects === "string" ? JSON.parse(allProjects) : allProjects;
        projId = parsed.projects?.[0]?.id;

        if (!projId) {
          return rejectWithValue("No projects found for user");
        }
      }

      dispatch(setActiveProjectId(projId));
      dispatch(
        projectApiSlice.endpoints.getProject.initiate(projectId, {
          // keep it in cache, don't create extra subscriptions in components
          subscribe: false,
          forceRefetch: true,
        })
      );
      return projectId;
    } catch (e) {
      return rejectWithValue(e?.message ?? String(e));
    }
  }
);


// projectSlice.js
export const switchProject = createAsyncThunk(
  "project/switchProject",
  async (projectId, { dispatch }) => {
    await dispatch(bootstrapProject(projectId)).unwrap();
    return projectId;
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setActiveProjectId(state, action) {
      state.activeProjectId = action.payload;
    },
    setBpServers(state, action) {
      console.warn("setBpServers called with", action.payload);
      state.bpServers = action.payload;
    },
    setBpServer(state, action) {
      console.warn("setBpServer called with", action.payload);
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
      .addCase(switchProject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(switchProject.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(switchProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to switch project";
      });
  },
})


export const {
  setActiveProjectId,
  setBpServers,
  setBpServer,
  selectServer,
  setAddToProject,
  setCostData,
  setProjectData,
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
export default projectSlice.reducer;

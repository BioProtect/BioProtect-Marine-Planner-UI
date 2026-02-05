import { apiSlice } from "./apiSlice";

// slices/prioritizrApiSlice.js
export const prioritizrApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listPrioritizrRuns: builder.query({
      query: (projectId) =>
        `prioritizr?action=list_runs&project_id=${projectId}`,
      providesTags: (res, err, projectId) => [
        { type: "PrioritizrRun", id: "LIST" },
        { type: "PrioritizrRun", id: projectId },
      ],
    }),

    getPrioritizrRun: builder.query({
      query: (runId) =>
        `prioritizr?action=get_run&run_id=${runId}`,
      providesTags: (res, err, runId) => [
        { type: "PrioritizrRun", id: runId },
      ],
    }),

    getPrioritizrRunResults: builder.query({
      query: (runId) =>
        `prioritizr?action=get_results&run_id=${runId}`,
      providesTags: (res, err, runId) => [
        { type: "PrioritizrResults", id: runId },
      ],
    }),
  }),
});

export const {
  useListPrioritizrRunsQuery,
  useGetPrioritizrRunQuery,
  useGetPrioritizrResultsQuery,
} = prioritizrApiSlice;
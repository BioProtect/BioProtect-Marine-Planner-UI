import { apiSlice } from "./apiSlice";

// slices/prioritizrApiSlice.js
export const prioritizrApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listPrioritizrRuns: builder.query({
      query: (projectId) =>
        `prioritizr?action=list-runs&project-id=${projectId}`,
      providesTags: (res, err, projectId) => [
        { type: "PrioritizrRun", id: "LIST" },
        { type: "PrioritizrRun", id: projectId },
      ],
    }),

    getPrioritizrRun: builder.query({
      query: (runId) =>
        `prioritizr?action=get-run&run-id=${runId}`,
      providesTags: (res, err, runId) => [
        { type: "PrioritizrRun", id: runId },
      ],
    }),

    getPrioritizrRunResults: builder.query({
      query: (runId) =>
        `prioritizr?action=get-results&run-id=${runId}`,
      providesTags: (res, err, runId) => [
        { type: "PrioritizrResults", id: runId },
      ],
    }),
  }),
});

export const {
  useListPrioritizrRunsQuery,
  useGetPrioritizrRunQuery,
  useGetPrioritizrRunResultsQuery,
} = prioritizrApiSlice;
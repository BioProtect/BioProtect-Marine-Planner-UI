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

    deletePrioritizrRun: builder.mutation({
      query: (runId) => ({
        url: `prioritizr?action=delete-run&run-id=${runId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "PrioritizrRun", id: "LIST" }],
    }),

    // runIds: sorted number[] — stable cache key, averaged on the server
    getFeatureRepresentation: builder.query({
      query: (runIds) =>
        `prioritizr?action=get-feature-representation&run-ids=${runIds.join(",")}`,
      providesTags: (res, err, runIds) => [
        { type: "PrioritizrResults", id: `repr-${runIds.join("-")}` },
      ],
    }),
  }),
});

export const {
  useListPrioritizrRunsQuery,
  useGetPrioritizrRunQuery,
  useGetPrioritizrRunResultsQuery,
  useGetFeatureRepresentationQuery,
  useDeletePrioritizrRunMutation,
} = prioritizrApiSlice;
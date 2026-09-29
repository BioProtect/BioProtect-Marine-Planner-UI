import { apiSlice } from "./apiSlice";

// The cost raster library: rasters that have already been extracted to
// per-hex values and then deleted. Reusing one builds a cost profile for
// any project without another upload — see server/handlers/cost_raster_handler.py.
export const costRasterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Rasters this user may reuse: their own, plus anything shared.
    // Pass projectId to get per-raster coverage of that project's hexes.
    listCostRasters: builder.query({
      query: (projectId) => ({
        url:
          "costRasters?action=list" +
          (projectId ? `&project_id=${projectId}` : ""),
        method: "GET",
      }),
      transformResponse: (raw) =>
        typeof raw === "string" ? JSON.parse(raw) : raw,
      providesTags: [{ type: "CostRaster", id: "LIST" }],
    }),

    // Build a cost profile for a project from a cached raster. No upload,
    // no raster IO, so this is a plain REST call rather than a WebSocket.
    createProfileFromRaster: builder.mutation({
      query: (body) => ({
        url: "costRasters",
        method: "POST",
        body: { action: "create_profile", ...body },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Project", id: arg.project_id },
      ],
    }),

    setCostRasterVisibility: builder.mutation({
      query: ({ rasterId, visibility }) => ({
        url: "costRasters",
        method: "POST",
        body: { action: "set_visibility", raster_id: rasterId, visibility },
      }),
      invalidatesTags: [{ type: "CostRaster", id: "LIST" }],
    }),

    deleteCostRaster: builder.mutation({
      query: (rasterId) => ({
        url: "costRasters",
        method: "POST",
        body: { action: "delete", raster_id: rasterId },
      }),
      invalidatesTags: [{ type: "CostRaster", id: "LIST" }],
    }),
  }),
});

export const {
  useListCostRastersQuery,
  useCreateProfileFromRasterMutation,
  useSetCostRasterVisibilityMutation,
  useDeleteCostRasterMutation,
} = costRasterApiSlice;

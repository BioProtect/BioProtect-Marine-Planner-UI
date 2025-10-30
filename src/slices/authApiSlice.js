import { apiSlice } from "./apiSlice";
const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `${API_BASE}/server/auth`,
        method: "POST",
        body: { ...credentials },
      }),
    }),
  }),
});

export const { useLoginMutation } = authApiSlice;

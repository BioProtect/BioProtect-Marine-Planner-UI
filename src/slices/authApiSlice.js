import { apiSlice } from "./apiSlice";
// import { getApiBaseUrl } from "@config/api"
// const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;


export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth",
        method: "POST",
        body: { ...credentials },
      }),
    }),
  }),
});

export const { useLoginMutation } = authApiSlice;

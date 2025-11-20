import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "./authSlice";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
import { getApiBaseUrl } from "@config/api";

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const { token } = getState().auth;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.originalStatus === 403) {
    const refreshResult = await baseQuery("/refresh", api, extraOptions);

    if (refreshResult?.data) {
      const { user } = api.getState().auth;
      api.dispatch(setCredentials({ ...refreshResult.data, user }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});

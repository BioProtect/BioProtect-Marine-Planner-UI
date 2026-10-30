import { getApiBaseUrl } from '@config/api'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { logOut } from './authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const { token } = getState().auth
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// The server authenticates with the signed session cookie set at login and
// ignores the bearer token, so there is no token to refresh: a 401 means the
// session is gone. A 403 means "not allowed" and must not log the user out.
async function baseQueryWithLogout(args, api, extraOptions) {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && api.getState().auth.isUserLoggedIn) {
    api.dispatch(logOut())
    // same as a manual logout: don't leave this user's data cached for the next one
    api.dispatch(apiSlice.util.resetApiState())
  }
  return result
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithLogout,
  tagTypes: [
    'Features',
    'Project',
    'ProjectList',
    'PrioritizrRun',
    'PrioritizrResults',
    'CostRaster',
  ],
  endpoints: () => ({}),
})

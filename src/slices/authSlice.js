import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: null,
    userData: {},
    token: null,
    project: null,
    isUserLoggedIn: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { userId, project, accessToken, userData } = action.payload;
      state.userId = userId;
      state.project = project;
      state.token = accessToken;
      state.userData = userData;
      state.isUserLoggedIn = true;
    },
    logOut: (state) => {
      state.userId = null;
      state.userData = {};
      state.token = null;
      state.project = null;
      state.isUserLoggedIn = false;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.userData;
export const selectCurrentUserId = (state) => state.auth.userId;
export const selectCurrentToken = (state) => state.auth.token;
export const selectUserProject = (state) => state.auth.project;
export const selectIsUserLoggedIn = (state) => state.auth.isUserLoggedIn;

import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    userId: null,
    userData: {
      
    },
    token: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, userId, accessToken } = action.payload;
      state.user = user;
      state.userId = userId;
      state.token = accessToken;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    logOut: (state, action) => {
      state.user = null;
      state.userId = null;
      state.token = null;
    },
  },
});

export const { setCredentials, setUserData, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentUserId = (state) => state.auth.userId;
export const selectCurrentToken = (state) => state.auth.token;
export const selectUserData = (state) => state.auth.userData;

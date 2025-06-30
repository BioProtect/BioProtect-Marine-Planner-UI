import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
  userData: {},
  token: null,
  isUserLoggedIn: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { userId, accessToken, userData } = action.payload;
      state.userId = userId;
      state.token = accessToken;
      state.userData = userData;
      state.isUserLoggedIn = true;
    },
    logOut: (state) => {
      state.userId = null;
      state.userData = {};
      state.token = null;
      state.isUserLoggedIn = false;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.userData;
export const selectCurrentUserId = (state) => state.auth.userId;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsUserLoggedIn = (state) => state.auth.isUserLoggedIn;

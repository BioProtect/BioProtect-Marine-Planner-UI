import { apiSlice } from "./apiSlice";
import { createSlice } from "@reduxjs/toolkit";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (user) => ({
        url: `users?action=get&user=${user}`,
        method: "GET",
      }),
    }),
    listUsers: builder.query({
      query: () => ({
        url: "users?action=list",
        method: "GET",
      }),
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: "users?action=create",
        method: "POST",
        body: user,
      }),
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: `users?action=update`,
        method: "POST",
        body: formData,   // can now accept FormData
      }),
    }),
    deleteUser: builder.mutation({
      query: (user) => ({
        url: `users?action=delete&user=${user}`,
        method: "GET",
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "users?action=logout",
        method: "GET",
      }),
    }),
    resendPassword: builder.query({
      query: () => ({
        url: "users?action=resend_password",
        method: "GET",
      }),
    }),
  }),
})

// export const { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } = userApiSlice;

export const {
  useGetUserQuery,
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLogoutUserMutation,
  useResendPasswordQuery,
} = userApiSlice;



// Define local slice for additional state management
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
  },
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = userSlice.actions;
export default userSlice.reducer;

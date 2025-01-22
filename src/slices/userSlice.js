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
      query: ({ id, user }) => ({
        url: `users?action=update`,
        method: "POST",
        body: { id, ...user },
      }),
    }),
    deleteUser: builder.mutation({
      query: (user) => ({
        url: `users?action=delete&user=${user}`,
        method: "GET",
      }),
    }),
    validateUser: builder.mutation({
      query: (credentials) => ({
        url: `users?action=validate`,
        method: "GET",
        params: credentials,
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


    // CODE FOR USING USER IDS AND A DATABASE - NOT FULLY IMPLEMENTED YET 
    // getUser: builder.query({
    //   query: () => "getUser",
    // }),
    // createUser: builder.mutation({
    //   query: (user) => ({
    //     url: "users",
    //     method: "POST",
    //     body: user,
    //   }),
    // }),
    // updateUser: builder.mutation({
    //   query: ({ id, user }) => ({
    //     url: `users/${id}`,
    //     method: "PUT",
    //     body: user,
    //   }),
    // }),
    // deleteUser: builder.mutation({
    //   query: (id) => ({
    //     url: `users/${id}`,
    //     method: "DELETE",
    //   }),
    // }),
  }),
})

// export const { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } = userApiSlice;

export const {
  useGetUserQuery,
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useValidateUserMutation,
  useLogoutUserMutation,
  useResendPasswordQuery,
} = userApiSlice;



// Define local slice for additional state management
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    users: [],
    isUserLoggedIn: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setLoggedIn(state, action) {
      state.isUserLoggedIn = action.payload;
    },
  },
});

export const { setUser, setUsers, setLoggedIn } = userSlice.actions;
export default userSlice.reducer;

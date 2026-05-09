import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import projectReducer from "../features/projectSlice";
import proposalReducer from "../features/proposalSlice"; // New import
import postReducer from "../features/postSlice"; // New import
import userReducer from "../features/userSlice"; // New import
import statReducer from "../features/statSlice"; // New import
import reviewReducer from "../features/reviewSlice"; // New import
import inviteReducer from "../features/inviteSlice"; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    proposals: proposalReducer, // Registered new slice
    posts: postReducer, // Registered new slice
    users: userReducer, // Registered new slice
    stats: statReducer, // Registered new slice
    reviews: reviewReducer, // Registered new slice
    invites: inviteReducer, // Registered new slice
  },
});
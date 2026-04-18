import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import projectReducer from "../features/projectSlice";
import proposalReducer from "../features/proposalSlice"; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    proposals: proposalReducer, // Registered new slice
  },
});
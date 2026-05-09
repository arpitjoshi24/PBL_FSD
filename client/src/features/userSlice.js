import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchFreelancers = createAsyncThunk("users/fetchFreelancers", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get("http://localhost:5000/api/users/freelancers", config);
  return response.data;
});

export const fetchSingleUser = createAsyncThunk("users/fetchSingle", async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`http://localhost:5000/api/users/profile/${id}`, config);
  return response.data;
});

const userSlice = createSlice({
  name: "users",
  initialState: { 
  freelancers: [], 
  singleUser: null, // Add this
  loading: false 
},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancers.pending, (state) => { state.loading = true; })
      .addCase(fetchFreelancers.fulfilled, (state, action) => {
        state.loading = false;
        state.freelancers = action.payload;
      })
      .addCase(fetchSingleUser.pending, (state) => { state.loading = true; })
.addCase(fetchSingleUser.fulfilled, (state, action) => {
  state.loading = false;
  state.singleUser = action.payload;
});
  },
});

export default userSlice.reducer;
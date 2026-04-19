import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/posts";

export const fetchPosts = createAsyncThunk("posts/fetch", async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addPost = createAsyncThunk("posts/add", async (postData, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL, postData, config);
  return response.data;
});

const postSlice = createSlice({
  name: "posts",
  initialState: { posts: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload); // Add new post to top
      });
  },
});

export default postSlice.reducer;
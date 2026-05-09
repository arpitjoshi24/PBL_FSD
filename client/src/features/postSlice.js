import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/posts";

// 1. FETCH POSTS (Updated to pass token so backend knows if "I" liked them)
export const fetchPosts = createAsyncThunk("posts/fetch", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Fetch failed");
  }
});

// 2. ADD POST (Unchanged, already perfect)
export const addPost = createAsyncThunk("posts/add", async (formData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const config = { 
      headers: { 
        Authorization: `Bearer ${token}`,
      } 
    };
    const response = await axios.post(API_URL, formData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Upload failed");
  }
});

// 3. TOGGLE LIKE (New: Handles the "One Like Per User" logic)
export const toggleLikePost = createAsyncThunk("posts/toggleLike", async (postId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.post(`${API_URL}/${postId}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // The backend returns { liked: true } or { liked: false }
    return { postId, liked: response.data.liked };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Like failed");
  }
});

const postSlice = createSlice({
  name: "posts",
  initialState: { 
    posts: [], 
    loading: false, 
    error: null 
  },
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Posts ---
      .addCase(fetchPosts.pending, (state) => { 
        state.loading = true; 
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // --- Add Post ---
      .addCase(addPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Toggle Like (Instant UI Feedback) ---
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        // Find the specific post in our Redux array
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          if (action.payload.liked) {
            // If the backend says we liked it, increment and turn it red
            post.like_count = parseInt(post.like_count || 0) + 1;
            post.liked_by_me = true;
          } else {
            // If the backend says we un-liked it, decrement and turn it gray
            post.like_count = Math.max(0, parseInt(post.like_count || 0) - 1);
            post.liked_by_me = false;
          }
        }
      });
  },
});

export const { clearPostError } = postSlice.actions;
export default postSlice.reducer;
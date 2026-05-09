import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to submit a review (Requires auth)
export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async (reviewData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token || localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/reviews", reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to submit review"
      );
    }
  }
);

// Thunk to fetch all reviews for a specific freelancer (Public)
export const fetchUserReviews = createAsyncThunk(
  "reviews/fetchUserReviews",
  async (userId, thunkAPI) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/freelancer/${userId}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    list: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetReviewState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- Submit Review --- */
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- Fetch User Reviews --- */
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
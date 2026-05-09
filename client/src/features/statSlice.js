import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk for Client Dashboard Stats
export const fetchClientStats = createAsyncThunk(
  "stats/fetchClientStats",
  async (timeframe = 'monthly', thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token || localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/users/stats/client?timeframe=${timeframe}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch client stats"
      );
    }
  }
);

// Thunk for Freelancer Dashboard Stats
export const fetchFreelancerStats = createAsyncThunk(
  "stats/fetchFreelancerStats",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token || localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/stats/freelancer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch freelancer stats"
      );
    }
  }
);

const statSlice = createSlice({
  name: "stats",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearStats: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- Client Stats --- */
      .addCase(fetchClientStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchClientStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- Freelancer Stats --- */
      .addCase(fetchFreelancerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreelancerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFreelancerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStats } = statSlice.actions;
export default statSlice.reducer;
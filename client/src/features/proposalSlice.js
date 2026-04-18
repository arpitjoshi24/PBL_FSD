import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  proposals: [],       // Proposals for a specific project (Client view)
  myProposals: [],     // Proposals sent by the logged-in freelancer (Freelancer view)
  loading: false,
  error: null,
  success: false,
};

/* ================================
   CREATE PROPOSAL (Freelancer)
================================= */
export const createProposal = createAsyncThunk(
  "proposals/createProposal",
  async (proposalData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/proposals",
        proposalData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to submit proposal"
      );
    }
  }
);

/* ================================
   FETCH PROJECT PROPOSALS (Client)
================================= */
export const fetchProjectProposals = createAsyncThunk(
  "proposals/fetchProjectProposals",
  async (projectId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/proposals/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch proposals"
      );
    }
  }
);

/* ================================
   ACCEPT PROPOSAL (Client)
================================= */
export const acceptProposal = createAsyncThunk(
  "proposals/acceptProposal",
  async (proposalId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/proposals/${proposalId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to accept proposal"
      );
    }
  }
);

/* ================================
   FETCH MY PROPOSALS (Freelancer Dashboard)
================================= */
export const fetchMyProposals = createAsyncThunk(
  "proposals/fetchMyProposals",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/proposals/my-proposals",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch your bids"
      );
    }
  }
);

const proposalSlice = createSlice({
  name: "proposals",
  initialState,
  reducers: {
    resetProposalState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== CREATE PROPOSAL ===== */
      .addCase(createProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.proposals.push(action.payload);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== FETCH PROJECT PROPOSALS (Client View) ===== */
      .addCase(fetchProjectProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload;
      })
      .addCase(fetchProjectProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== ACCEPT PROPOSAL ===== */
      .addCase(acceptProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(acceptProposal.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(acceptProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== FETCH MY PROPOSALS (Freelancer Dashboard) ===== */
      .addCase(fetchMyProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.myProposals = action.payload;
      })
      .addCase(fetchMyProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProposalState } = proposalSlice.actions;
export default proposalSlice.reducer;
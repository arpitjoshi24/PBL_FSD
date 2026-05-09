import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  sentInvites: [],       // For Client Dashboard
  receivedInvites: [],   // For Freelancer Dashboard
  loading: false,
  error: null,
  success: false,
};

// 1. Send Invite (From Freelancer Profile)
export const sendInvite = createAsyncThunk(
  "invites/sendInvite",
  async (inviteData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/invites",
        inviteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send invite"
      );
    }
  }
);

// 2. Fetch Client's Sent Invites
export const fetchClientInvites = createAsyncThunk(
  "invites/fetchClientInvites",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/invites/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// 3. Fetch Freelancer's Received Invites
export const fetchFreelancerInvites = createAsyncThunk(
  "invites/fetchFreelancerInvites",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/invites/freelancer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// 4. Update Invite Status (Accept/Reject/Expire)
export const updateInviteStatus = createAsyncThunk(
  "invites/updateInviteStatus",
  async ({ inviteId, status }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/invites/${inviteId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const inviteSlice = createSlice({
  name: "invites",
  initialState,
  reducers: {
    resetInviteSuccess: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Invite
      .addCase(sendInvite.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendInvite.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(sendInvite.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Fetch Client
      .addCase(fetchClientInvites.fulfilled, (state, action) => { state.sentInvites = action.payload; })
      
      // Fetch Freelancer
      .addCase(fetchFreelancerInvites.fulfilled, (state, action) => { state.receivedInvites = action.payload; })
      
      // Update Status
      .addCase(updateInviteStatus.fulfilled, (state, action) => {
         // Optimistically update the arrays if needed, or rely on a re-fetch
         state.success = true;
      });
  },
});

export const { resetInviteSuccess } = inviteSlice.actions;
export default inviteSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ================================
   CREATE PROJECT (Client)
================================= */
export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/projects",
        projectData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

/* ================================
   FETCH ALL PROJECTS (Marketplace)
================================= */
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.minBudget) queryParams.append("minBudget", filters.minBudget);
      if (filters.maxBudget) queryParams.append("maxBudget", filters.maxBudget);
      if (filters.skills) queryParams.append("skills", filters.skills);
      if (filters.deadline) queryParams.append("deadline", filters.deadline);

      const response = await axios.get(
        `http://localhost:5000/api/projects?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching projects"
      );
    }
  }
);

/* ================================
   FETCH SINGLE PROJECT DETAILS
================================= */
export const fetchSingleProject = createAsyncThunk(
  "projects/fetchSingleProject",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching project details"
      );
    }
  }
);

/* ================================
   UPDATE PROJECT STATUS (Owner Action)
================================= */
export const updateProjectStatus = createAsyncThunk(
  "projects/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/projects/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

/* ================================
   FETCH MY PROJECTS (Client Dashboard)
================================= */
export const fetchMyProjects = createAsyncThunk(
  "projects/fetchMyProjects",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/projects/my-projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch your projects"
      );
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [],      // Marketplace projects
    myProjects: [],    // Client's own projects
    singleProject: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetProjectState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- Create Project --- */
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- Fetch All Projects --- */
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- Fetch Single Project --- */
      .addCase(fetchSingleProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSingleProject.fulfilled, (state, action) => {
        state.loading = false;
        state.singleProject = action.payload;
      })
      .addCase(fetchSingleProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- Fetch My Projects (Dashboard) --- */
      .addCase(fetchMyProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.myProjects = action.payload;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- Update Status --- */
      .addCase(updateProjectStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update the project in the list if it exists there
        const index = state.myProjects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.myProjects[index] = action.payload;
        if (state.singleProject?.id === action.payload.id) state.singleProject = action.payload;
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProjectState } = projectSlice.actions;
export default projectSlice.reducer;
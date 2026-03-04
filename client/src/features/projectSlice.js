import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/projects",
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.minBudget)
        queryParams.append("minBudget", filters.minBudget);

      if (filters.maxBudget)
        queryParams.append("maxBudget", filters.maxBudget);

      if (filters.skills)
        queryParams.append("skills", filters.skills);

      if (filters.deadline)
        queryParams.append("deadline", filters.deadline);

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

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [],
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
});
  },
});


export const { resetProjectState } = projectSlice.actions;
export default projectSlice.reducer;
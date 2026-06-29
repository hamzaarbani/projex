import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// -------- Async thunks --------
export const createProject = createAsyncThunk(
  'projects/create',
  async ({ name, description, workspaceId }, { rejectWithValue }) => {
    try {
      const res = await api.post('/projects', { name, description, workspaceId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to create project' });
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'projects/fetch',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/workspace/${workspaceId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch projects' });
    }
  }
);

// ✅ Update project
export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, name, description }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/projects/${id}`, { name, description });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update project' });
    }
  }
);

// ✅ Delete project
export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to delete project' });
    }
  }
);

// -------- Initial state --------
const initialState = {
  projects: [],
  isLoading: false,
  error: null,
};

// -------- Slice --------
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      // ✅ Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.projects[index] = action.payload;
      })
      // ✅ Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
      });
  },
});

export default projectSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Create workspace
export const createWorkspace = createAsyncThunk(
  'workspaces/create',
  async (workspaceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/workspaces', workspaceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create workspace' });
    }
  }
);

// Get all workspaces
export const getWorkspaces = createAsyncThunk(
  'workspaces/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workspaces');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch workspaces' });
    }
  }
);

// Delete workspace
export const deleteWorkspace = createAsyncThunk(
  'workspaces/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/workspaces/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete workspace' });
    }
  }
);

// ✅ Update workspace (new)
export const updateWorkspace = createAsyncThunk(
  'workspaces/update',
  async ({ id, name, description }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/workspaces/${id}`, { name, description });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update workspace' });
    }
  }
);

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create workspace
      .addCase(createWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces.push(action.payload);
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create workspace';
      })
      // Get workspaces
      .addCase(getWorkspaces.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces = action.payload;
      })
      .addCase(getWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch workspaces';
      })
      // Delete workspace
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter(w => w._id !== action.payload);
      })
      // ✅ Update workspace
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        const index = state.workspaces.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workspaces[index] = action.payload;
        }
      });
  },
});

export const { setCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
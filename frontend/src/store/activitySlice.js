import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchActivityLogs = createAsyncThunk(
  'activity/fetch',
  async ({ workspaceId, projectId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (projectId) params.append('projectId', projectId);
      const res = await api.get(`/activity?${params.toString()}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch logs' });
    }
  }
);

const initialState = {
  logs: [],
  isLoading: false,
  error: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch logs';
      });
  },
});

export default activitySlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchSubtasks = createAsyncThunk(
  'subtasks/fetch',
  async (taskId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/subtasks/task/${taskId}`);
      return { taskId, subtasks: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch subtasks' });
    }
  }
);

export const createSubtask = createAsyncThunk(
  'subtasks/create',
  async ({ taskId, title }, { rejectWithValue }) => {
    try {
      const res = await api.post('/subtasks', { taskId, title });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to create subtask' });
    }
  }
);

export const toggleSubtask = createAsyncThunk(
  'subtasks/toggle',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/subtasks/${id}/toggle`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to toggle subtask' });
    }
  }
);

export const deleteSubtask = createAsyncThunk(
  'subtasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/subtasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to delete subtask' });
    }
  }
);

const subtaskSlice = createSlice({
  name: 'subtasks',
  initialState: { subtasks: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubtasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubtasks.fulfilled, (state, action) => {
        state.loading = false;
        state.subtasks[action.payload.taskId] = action.payload.subtasks;
      })
      .addCase(fetchSubtasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch subtasks';
      })
      .addCase(createSubtask.fulfilled, (state, action) => {
        const taskId = action.payload.task;
        if (state.subtasks[taskId]) {
          state.subtasks[taskId].push(action.payload);
        } else {
          state.subtasks[taskId] = [action.payload];
        }
      })
      .addCase(toggleSubtask.fulfilled, (state, action) => {
        const taskId = action.payload.task;
        const subtasks = state.subtasks[taskId];
        if (subtasks) {
          const index = subtasks.findIndex(s => s._id === action.payload._id);
          if (index !== -1) subtasks[index] = action.payload;
        }
      })
      .addCase(deleteSubtask.fulfilled, (state, action) => {
        for (const taskId in state.subtasks) {
          state.subtasks[taskId] = state.subtasks[taskId].filter(s => s._id !== action.payload);
        }
      });
  },
});

export default subtaskSlice.reducer;
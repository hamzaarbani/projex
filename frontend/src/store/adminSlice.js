import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchAdminStats = createAsyncThunk('admin/stats', async () => {
  const res = await api.get('/admin/stats');
  return res.data;
});

export const fetchAllUsers = createAsyncThunk('admin/users', async () => {
  const res = await api.get('/admin/users');
  return res.data;
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id) => {
  await api.delete(`/admin/users/${id}`);
  return id;
});

const initialState = {
  stats: { totalUsers: 0, totalWorkspaces: 0, totalProjects: 0, totalTasks: 0 },
  users: [],
  loading: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
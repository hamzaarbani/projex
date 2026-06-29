import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// -------- Async thunks --------

// Fetch all tasks for a project
export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch tasks' });
    }
  }
);

// Create a new task
export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { rejectWithValue }) => {
    try {
      const res = await api.post('/tasks', taskData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to create task' });
    }
  }
);

// Update only the status (used for drag & drop)
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/tasks/${taskId}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update task status' });
    }
  }
);

// ✅ Full update (title, description, priority, dueDate, assignees, status)
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, ...taskData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/tasks/${id}`, taskData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update task' });
    }
  }
);

// ✅ Delete a task
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id; // return the id so we can remove it from the state
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to delete task' });
    }
  }
);

// -------- Initial state --------
const initialState = {
  tasks: [],
  isLoading: false,
  error: null,
};

// -------- Slice --------
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Manual reducers for optimistic updates
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTaskLocal: (state, action) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) state.tasks[index] = action.payload;
    },
    removeTaskLocal: (state, action) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch tasks';
      })

      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })

      // Update task status (drag & drop)
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
      })

      // ✅ Full update
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
      })

      // ✅ Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      });
  },
});

// -------- Exports --------
export const { addTask, updateTaskLocal, removeTaskLocal, setTasks } = taskSlice.actions;
export default taskSlice.reducer;
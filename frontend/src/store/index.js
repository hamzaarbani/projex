import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import workspaceReducer from './workspaceSlice';
import projectReducer from './projectSlice';
import taskReducer from './taskSlice';
import activityReducer from './activitySlice';
import subtaskReducer from './subtaskSlice'; // ✅ added

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspaces: workspaceReducer,
    projects: projectReducer,
    tasks: taskReducer,
    activity: activityReducer,
    subtasks: subtaskReducer, // ✅ subtask state
  },
});
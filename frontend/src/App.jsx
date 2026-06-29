import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './store/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import Workspaces from './pages/Workspaces';
import CalendarView from './pages/CalendarView';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import WorkspaceDetail from './pages/WorkspaceDetail';
import AcceptInvite from './pages/AcceptInvite';

const ProtectedRoute = ({ children }) => {
  const { token, user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [token, user, isLoading, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return token && user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/workspaces" element={<ProtectedRoute><Layout><Workspaces /></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarView /></Layout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/workspace/:id" element={<ProtectedRoute><Layout><WorkspaceDetail /></Layout></ProtectedRoute>} />
        <Route path="/project/:projectId" element={<ProtectedRoute><Layout><ProjectBoard /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
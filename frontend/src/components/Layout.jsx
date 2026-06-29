import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { 
  HomeIcon, 
  FolderIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import NotificationBell from './NotificationBell';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { workspaces } = useSelector((state) => state.workspaces);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Workspaces', href: '/workspaces', icon: FolderIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Team Chat', href: '/chat', icon: ChatBubbleLeftIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => location.pathname === path;
  const isActiveWorkspace = (id) => location.pathname === `/workspace/${id}`;

  const closeSidebar = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md"
      >
        {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Projex
          </h1>
        </div>

        {/* User info with Notification Bell */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Workspaces sub-list */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspaces</p>
            <div className="mt-2 space-y-1">
              {workspaces.map((ws) => (
                <Link
                  key={ws._id}
                  to={`/workspace/${ws._id}`}
                  onClick={closeSidebar}
                  className={`flex items-center px-4 py-2 text-sm rounded-xl transition ${
                    isActiveWorkspace(ws._id)
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FolderIcon className="w-4 h-4 mr-3 text-gray-400" />
                  {ws.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* ✅ Dark Mode Toggle – fully verified */}
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 mr-3" />
            ) : (
              <MoonIcon className="w-5 h-5 mr-3" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
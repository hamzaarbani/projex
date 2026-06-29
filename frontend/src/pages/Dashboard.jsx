import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { getWorkspaces, createWorkspace, deleteWorkspace } from '../store/workspaceSlice';
import { fetchProjects, createProject, deleteProject } from '../store/projectSlice';
import { fetchTasks } from '../store/taskSlice';
import ProjectModal from '../components/ProjectModal';
import ActivityLog from '../components/ActivityLog';
import CenterMessage from '../components/CenterMessage';
import { motion } from 'framer-motion';
import { 
  FolderIcon, 
  ClipboardDocumentListIcon, 
  UsersIcon, 
  CheckCircleIcon,
  PlusIcon,
  ArrowPathIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { workspaces, isLoading: workspacesLoading } = useSelector((state) => state.workspaces);
  const { projects, isLoading: projectsLoading } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Invite state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Confirmation for delete project
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Center message state
  const [centerMessage, setCenterMessage] = useState({ isOpen: false, message: '', type: 'success' });

  const showCenterMessage = (message, type = 'success') => {
    setCenterMessage({ isOpen: true, message, type });
  };

  const hideCenterMessage = () => {
    setCenterMessage({ isOpen: false, message: '', type: 'success' });
  };

  useEffect(() => {
    dispatch(getWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      dispatch(fetchProjects(selectedWorkspaceId));
    }
  }, [selectedWorkspaceId, dispatch]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        if (project._id) {
          dispatch(fetchTasks(project._id));
        }
      });
    }
  }, [projects, dispatch]);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const handleLogout = () => dispatch(logout());

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    dispatch(createWorkspace({ name: workspaceName, description: workspaceDescription }))
      .unwrap()
      .then(() => {
        setWorkspaceName('');
        setWorkspaceDescription('');
        setShowWorkspaceModal(false);
        showCenterMessage('Workspace created successfully!', 'success');
      })
      .catch((err) => {
        showCenterMessage(err.message || 'Failed to create workspace', 'error');
      });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(getWorkspaces());
    if (selectedWorkspaceId) {
      await dispatch(fetchProjects(selectedWorkspaceId));
    }
    setIsRefreshing(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!selectedWorkspaceId || !inviteEmail) return;
    if (isInviting) return;

    setIsInviting(true);
    setInviteSuccess(false);
    try {
      await api.post('/invitations/invite', { email: inviteEmail, workspaceId: selectedWorkspaceId });
      setIsInviting(false);
      setInviteSuccess(true);
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteSuccess(false);
      }, 3000);
    } catch (err) {
      showCenterMessage(err.response?.data?.message || 'Failed to send invite', 'error');
      setIsInviting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await dispatch(deleteProject(projectToDelete)).unwrap();
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      showCenterMessage('Project deleted successfully!', 'success');
    } catch (err) {
      showCenterMessage(err.message || 'Failed to delete project', 'error');
    }
  };

  // Stats
  const totalWorkspaces = workspaces.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const totalMembers = workspaces.reduce((acc, ws) => acc + (ws.members?.length || 0), 0);
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const stats = [
    { name: 'Workspaces', value: totalWorkspaces, icon: FolderIcon, color: 'bg-indigo-500' },
    { name: 'Projects', value: totalProjects, icon: ClipboardDocumentListIcon, color: 'bg-blue-500' },
    { name: 'Tasks', value: totalTasks, icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'Members', value: totalMembers, icon: UserGroupIcon, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.name || user?.email}! Here's what's happening.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Workspace
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl p-6 flex items-center transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className={`${stat.color} p-3 rounded-xl mr-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Progress */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Progress</h3>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{completionRate}% Complete</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400">To Do: {todoTasks}</span>
            <span className="text-yellow-500">In Progress: {inProgressTasks}</span>
            <span className="text-green-500">Done: {doneTasks}</span>
          </div>
        </motion.div>
      )}

      {/* Main workspace/project area */}
      {workspacesLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading workspaces...</p>
          </div>
        </div>
      ) : workspaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
            <FolderIcon className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Workspaces Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Create your first workspace to start organizing your projects and tasks.
          </p>
          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            Create Workspace
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Workspace list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Workspaces</h2>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                {totalWorkspaces}
              </span>
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => setSelectedWorkspaceId(ws._id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                    selectedWorkspaceId === ws._id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{ws.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {ws.owner?.name || 'Unknown'} • {ws.members?.length || 0} members
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowWorkspaceModal(true)}
              className="mt-4 w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New Workspace
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="mt-2 w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              <UserGroupIcon className="w-4 h-4" />
              Invite Member
            </button>
          </motion.div>

          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  {selectedWorkspaceId ? 'Projects' : 'Select a Workspace'}
                </h2>
                {selectedWorkspaceId && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {projects.length} projects in this workspace
                  </p>
                )}
              </div>
              {selectedWorkspaceId && (
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setShowProjectModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Project
                </button>
              )}
            </div>

            {projectsLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
                </div>
              </div>
            ) : !selectedWorkspaceId ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a workspace from the left to see its projects.
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <FolderIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No projects yet. Create your first project!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, index) => {
                  const projectTasks = tasks.filter(t => t.project === project._id);
                  const done = projectTasks.filter(t => t.status === 'done').length;
                  const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;

                  return (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border border-gray-200 dark:border-gray-700 p-5 rounded-xl hover:shadow-lg transition-all hover:border-indigo-300 dark:hover:border-indigo-700 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setShowProjectModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setProjectToDelete(project._id);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {projectTasks.length > 0 && (
                        <div className="mt-3">
                          <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{projectTasks.length} tasks</span>
                            <span>{done} done</span>
                          </div>
                        </div>
                      )}

                      <Link
                        to={`/project/${project._id}`}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition text-sm font-medium"
                      >
                        Open Board
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Activity Logs */}
      {selectedWorkspaceId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Live feed</span>
          </div>
          <ActivityLog workspaceId={selectedWorkspaceId} />
        </motion.div>
      )}

      {/* Modals */}

      {/* Create Workspace Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create Workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition">
                  Create
                </button>
                <button type="button" onClick={() => setShowWorkspaceModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Project Modal (Create/Edit) */}
      {showProjectModal && selectedWorkspaceId && (
        <ProjectModal
          workspaceId={selectedWorkspaceId}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          projectToEdit={editingProject}
        />
      )}

      {/* Enhanced Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            {isInviting && (
              <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Sending invitation...</p>
              </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Invite Member</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter the email of the person you want to invite to this workspace.
            </p>

            {inviteSuccess ? (
              <div className="text-center py-6">
                <div className="text-7xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Invitation Sent!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  An invitation has been sent to <strong>{inviteEmail}</strong>.
                </p>
                <p className="text-xs text-gray-400 mt-3">Closing in a moment...</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className={isInviting ? 'pointer-events-none opacity-50' : ''}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                  required
                  disabled={isInviting}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isInviting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Invite'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      setIsInviting(false);
                      setInviteSuccess(false);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition"
                    disabled={isInviting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal for Project */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will also delete all tasks inside it."
        confirmText="Delete"
        confirmColor="red"
      />

      {/* ✅ Center Message Modal */}
      <CenterMessage
        isOpen={centerMessage.isOpen}
        onClose={hideCenterMessage}
        message={centerMessage.message}
        type={centerMessage.type}
        duration={3000}
      />
    </div>
  );
};

export default Dashboard;
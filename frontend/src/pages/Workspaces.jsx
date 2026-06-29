import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkspaces, createWorkspace, deleteWorkspace } from '../store/workspaceSlice';
import { motion } from 'framer-motion';
import { FolderIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';
import CenterMessage from '../components/CenterMessage';

const Workspaces = () => {
  const dispatch = useDispatch();
  const { workspaces, isLoading } = useSelector((state) => state.workspaces);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

  // Center message
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

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showCenterMessage('Workspace name is required', 'error');
      return;
    }
    dispatch(createWorkspace({ name, description }))
      .unwrap()
      .then(() => {
        showCenterMessage('Workspace created successfully!', 'success');
        setShowModal(false);
        setName('');
        setDescription('');
      })
      .catch((err) => {
        showCenterMessage(err.message || 'Failed to create workspace', 'error');
      });
  };

  const confirmDelete = (id) => {
    setWorkspaceToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (!workspaceToDelete) return;
    dispatch(deleteWorkspace(workspaceToDelete))
      .unwrap()
      .then(() => {
        showCenterMessage('Workspace deleted successfully!', 'success');
        setShowDeleteConfirm(false);
        setWorkspaceToDelete(null);
      })
      .catch((err) => {
        showCenterMessage(err.message || 'Failed to delete workspace', 'error');
        setShowDeleteConfirm(false);
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workspaces</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all your workspaces</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 transition"
        >
          <PlusIcon className="w-5 h-5" />
          New Workspace
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <FolderIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No workspaces yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Create your first workspace to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <motion.div
              key={ws._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ws.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {ws.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {ws.members?.length || 0} members · Owner: {ws.owner?.name}
                  </p>
                </div>
                <button
                  onClick={() => confirmDelete(ws._id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create Workspace</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition">
                  Create
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setWorkspaceToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Workspace"
        message="Are you sure you want to delete this workspace? This will also delete all projects and tasks inside it."
        confirmText="Delete"
        confirmColor="red"
      />

      {/* Center Message */}
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

export default Workspaces;
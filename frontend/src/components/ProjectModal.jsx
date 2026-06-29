import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProject, updateProject } from '../store/projectSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ProjectModal = ({ workspaceId, onClose, projectToEdit }) => {
  const dispatch = useDispatch();
  const isEditing = !!projectToEdit;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
    }
  }, [projectToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    try {
      if (isEditing) {
        await dispatch(updateProject({ id: projectToEdit._id, name, description })).unwrap();
        toast.success('Project updated!');
      } else {
        await dispatch(createProject({ name, description, workspaceId })).unwrap();
        toast.success('Project created!');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {isEditing ? 'Edit Project' : 'Create Project'}
        </h2>
        <form onSubmit={handleSubmit}>
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
              {isEditing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectModal;
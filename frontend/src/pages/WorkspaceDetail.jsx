import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import { updateWorkspace } from '../store/workspaceSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserIcon, TrashIcon, ArrowLeftIcon, FolderIcon, UserGroupIcon, PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';
import CenterMessage from '../components/CenterMessage';
import ProjectModal from '../components/ProjectModal';

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Center message
  const [centerMessage, setCenterMessage] = useState({ isOpen: false, message: '', type: 'success' });

  const showCenterMessage = (message, type = 'success') => {
    setCenterMessage({ isOpen: true, message, type });
  };

  const hideCenterMessage = () => {
    setCenterMessage({ isOpen: false, message: '', type: 'success' });
  };

  const fetchWorkspace = async () => {
    try {
      const res = await api.get(`/workspaces/${id}`);
      setWorkspace(res.data);
    } catch (err) {
      showCenterMessage('Failed to load workspace', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const isOwner = workspace?.owner?._id === user?._id;

  const handleRemoveMember = async (memberId) => {
    setRemoving(memberId);
    try {
      await api.delete(`/workspaces/${id}/members/${memberId}`);
      showCenterMessage('Member removed successfully!', 'success');
      fetchWorkspace();
    } catch (err) {
      showCenterMessage(err.response?.data?.message || 'Failed to remove member', 'error');
    } finally {
      setRemoving(null);
      setShowConfirmModal(false);
      setMemberToRemove(null);
    }
  };

  const confirmRemove = (memberId) => {
    setMemberToRemove(memberId);
    setShowConfirmModal(true);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await api.post('/invitations/invite', { email: inviteEmail, workspaceId: id });
      showCenterMessage('Invitation sent successfully!', 'success');
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (err) {
      showCenterMessage(err.response?.data?.message || 'Failed to send invite', 'error');
    }
  };

  const openEditModal = () => {
    setEditName(workspace.name);
    setEditDescription(workspace.description || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showCenterMessage('Name is required', 'error');
      return;
    }
    try {
      await dispatch(updateWorkspace({ id, name: editName, description: editDescription })).unwrap();
      showCenterMessage('Workspace updated successfully!', 'success');
      setShowEditModal(false);
      fetchWorkspace();
    } catch (err) {
      showCenterMessage(err.message || 'Failed to update workspace', 'error');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await dispatch(deleteProject(projectToDelete)).unwrap();
      showCenterMessage('Project deleted successfully!', 'success');
      setShowDeleteProjectConfirm(false);
      setProjectToDelete(null);
      fetchWorkspace();
    } catch (err) {
      showCenterMessage(err.message || 'Failed to delete project', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return <div className="p-6 text-center text-gray-600">Workspace not found</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {workspace.name}
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {workspace.members?.length || 0} members
          </span>
        </div>
        {isOwner && (
          <button
            onClick={openEditModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Workspace
          </button>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {workspace.description || 'No description'}
      </p>

      {/* Members */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-indigo-500" />
          Members
        </h2>
        <div className="space-y-2">
          {workspace.members?.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  {member.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.name}
                    {member._id === workspace.owner?._id && (
                      <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        Owner
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                </div>
              </div>
              {isOwner && member._id !== workspace.owner?._id && (
                <button
                  onClick={() => confirmRemove(member._id)}
                  disabled={removing === member._id}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {removing === member._id ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TrashIcon className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          ))}
          {(!workspace.members || workspace.members.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No members yet.</p>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-indigo-500" />
            Projects
          </h2>
          {isOwner && (
            <button
              onClick={() => {
                setEditingProject(null);
                setShowProjectModal(true);
              }}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
            >
              + New
            </button>
          )}
        </div>
        {workspace.projects && workspace.projects.length > 0 ? (
          <div className="space-y-2">
            {workspace.projects.map((project) => (
              <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <Link to={`/project/${project._id}`} className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.description || 'No description'}
                  </p>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setShowProjectModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setProjectToDelete(project._id);
                      setShowDeleteProjectConfirm(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No projects yet.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        {workspace.projects && workspace.projects.length > 0 ? (
          <Link
            to={`/project/${workspace.projects[0]._id}`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            View First Project
          </Link>
        ) : (
          <span className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
            No Projects
          </span>
        )}
        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <UserGroupIcon className="w-5 h-5" />
            Invite Member
          </button>
        )}
      </div>

      {/* Confirmation Modal for Member Removal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setMemberToRemove(null);
        }}
        onConfirm={() => handleRemoveMember(memberToRemove)}
        title="Remove Member"
        message="Are you sure you want to remove this member from the workspace?"
        confirmText="Remove"
        confirmColor="red"
      />

      {/* Edit Workspace Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Workspace</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition">
                  Update
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Invite Member</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter the email of the person you want to invite to this workspace.
            </p>
            <form onSubmit={handleInvite}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition">
                  Send Invite
                </button>
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Project Modal (Create/Edit) */}
      {showProjectModal && (
        <ProjectModal
          workspaceId={id}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          projectToEdit={editingProject}
        />
      )}

      {/* Delete Project Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteProjectConfirm}
        onClose={() => {
          setShowDeleteProjectConfirm(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will also delete all tasks inside it."
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
    </motion.div>
  );
};

export default WorkspaceDetail;
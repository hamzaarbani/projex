import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubtasks, createSubtask, toggleSubtask, deleteSubtask } from '../store/subtaskSlice';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from './ConfirmationModal';

const SubtaskList = ({ taskId, onShowMessage }) => {
  const dispatch = useDispatch();
  const { subtasks, loading } = useSelector((state) => state.subtasks);
  const [newTitle, setNewTitle] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState(null);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchSubtasks(taskId));
    }
  }, [dispatch, taskId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowMessage('Subtask title is required', 'error');
      return;
    }
    try {
      await dispatch(createSubtask({ taskId, title: newTitle })).unwrap();
      setNewTitle('');
      setShowInput(false);
      onShowMessage('Subtask added successfully!', 'success');
    } catch (err) {
      onShowMessage('Failed to add subtask', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleSubtask(id)).unwrap();
      onShowMessage('Subtask updated!', 'success');
    } catch (err) {
      onShowMessage('Failed to toggle subtask', 'error');
    }
  };

  const confirmDelete = (id) => {
    setSubtaskToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!subtaskToDelete) return;
    try {
      await dispatch(deleteSubtask(subtaskToDelete)).unwrap();
      onShowMessage('Subtask deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setSubtaskToDelete(null);
    } catch (err) {
      onShowMessage('Failed to delete subtask', 'error');
      setShowDeleteConfirm(false);
    }
  };

  const taskSubtasks = subtasks[taskId] || [];

  if (loading && taskSubtasks.length === 0) {
    return <div className="text-sm text-gray-500">Loading subtasks...</div>;
  }

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subtasks</h4>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          Add
        </button>
      </div>

      {showInput && (
        <form onSubmit={handleAdd} className="flex gap-2 mt-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            autoFocus
          />
          <button type="submit" className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg">
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="mt-2 space-y-1">
        {taskSubtasks.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">No subtasks yet.</p>
        )}
        {taskSubtasks.map((sub) => (
          <div
            key={sub._id}
            className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={sub.isCompleted}
                onChange={() => handleToggle(sub._id)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className={`text-sm ${sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                {sub.title}
              </span>
            </label>
            <button onClick={() => confirmDelete(sub._id)} className="text-red-500 hover:text-red-700">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSubtaskToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Subtask"
        message="Are you sure you want to delete this subtask?"
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
};

export default SubtaskList;
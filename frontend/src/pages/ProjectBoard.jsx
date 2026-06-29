import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTasks, deleteTask } from '../store/taskSlice'; // ✅ import deleteTask
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import CommentSection from '../components/CommentSection';
import AttachmentUpload from '../components/AttachmentUpload';
import SubtaskList from '../components/SubtaskList';
import CenterMessage from '../components/CenterMessage';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion } from 'framer-motion';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, tasks } = useSelector((state) => state.tasks);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [aiSummary, setAiSummary] = useState('');
  const [suggestedPriority, setSuggestedPriority] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [centerMessage, setCenterMessage] = useState({ isOpen: false, message: '', type: 'success' });

  const showCenterMessage = (message, type = 'success') => {
    setCenterMessage({ isOpen: true, message, type });
  };

  const hideCenterMessage = () => {
    setCenterMessage({ isOpen: false, message: '', type: 'success' });
  };

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }
    dispatch(fetchTasks(projectId));
  }, [dispatch, projectId, navigate]);

  if (!projectId) {
    return <div className="p-6 text-center text-gray-600">Invalid project ID</div>;
  }

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setAiSummary('');
    setSuggestedPriority('');
  };

  const handleViewTask = (task) => {
    console.log('📂 Viewing task:', task);
    setSelectedTask(task);
    setShowDetailModal(true);
    setAiSummary('');
    setSuggestedPriority('');
  };

  const confirmDeleteTask = () => {
    if (!selectedTask) {
      showCenterMessage('No task selected to delete', 'error');
      return;
    }
    console.log('🗑️ Delete requested for task:', selectedTask._id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) {
      showCenterMessage('Task not found', 'error');
      return;
    }
    try {
      await dispatch(deleteTask(selectedTask._id)).unwrap(); // ✅ uses Redux thunk
      showCenterMessage('Task deleted successfully!', 'success');
      setShowDetailModal(false);
      setShowDeleteConfirm(false);
      setSelectedTask(null);
      // No need to fetch again – Redux state is already updated
    } catch (err) {
      console.error('❌ Delete error:', err);
      showCenterMessage(err.message || 'Failed to delete task', 'error');
      setShowDeleteConfirm(false);
    }
  };

  // AI Handlers (unchanged)
  const handleSummarize = async () => {
    if (!selectedTask) return;
    try {
      const res = await api.post('/ai/summarize', { text: selectedTask.description || selectedTask.title });
      setAiSummary(res.data.summary);
      showCenterMessage('Summary generated!', 'success');
    } catch (err) {
      showCenterMessage('Summarization failed', 'error');
    }
  };

  const handleSuggestPriority = async () => {
    if (!selectedTask) return;
    try {
      const res = await api.post('/ai/priority', { title: selectedTask.title, description: selectedTask.description || '' });
      setSuggestedPriority(res.data.priority);
      showCenterMessage('Priority suggested!', 'success');
    } catch (err) {
      showCenterMessage('Priority suggestion failed', 'error');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="text-xl text-gray-600">Loading tasks...</div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Board</h1>
        <button onClick={() => setShowTaskModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">+ New Task</button>
      </div>

      <KanbanBoard projectId={projectId} onEditTask={handleEditTask} onViewTask={handleViewTask} />

      {showTaskModal && (
        <CreateTaskModal projectId={projectId} onClose={handleCloseModal} taskToEdit={editingTask} onShowMessage={showCenterMessage} />
      )}

      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTask.title}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-gray-600 dark:text-gray-300">{selectedTask.description || 'No description'}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Status: <span className="font-medium">{selectedTask.status}</span></span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Priority: <span className="font-medium">{selectedTask.priority}</span></span>
                {selectedTask.dueDate && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Due: <span className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</span></span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={handleSummarize} className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
                <SparklesIcon className="w-4 h-4" /> Summarize
              </button>
              <button onClick={handleSuggestPriority} className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
                <SparklesIcon className="w-4 h-4" /> Suggest Priority
              </button>
            </div>

            {aiSummary && <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"><p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">📝 Summary:</span> {aiSummary}</p></div>}
            {suggestedPriority && <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"><p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">🏷️ Suggested Priority:</span> <span className={`font-bold capitalize ${suggestedPriority === 'high' ? 'text-red-600' : suggestedPriority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{suggestedPriority}</span></p></div>}

            <SubtaskList taskId={selectedTask._id} onShowMessage={showCenterMessage} />
            <CommentSection taskId={selectedTask._id} />
            <AttachmentUpload taskId={selectedTask._id} />

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => { setShowDetailModal(false); handleEditTask(selectedTask); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Edit Task</button>
              <button onClick={confirmDeleteTask} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete Task</button>
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${selectedTask?.title || ''}"?`}
        confirmText="Delete"
        confirmColor="red"
      />

      <CenterMessage isOpen={centerMessage.isOpen} onClose={hideCenterMessage} message={centerMessage.message} type={centerMessage.type} duration={3000} />
    </motion.div>
  );
};

export default ProjectBoard;
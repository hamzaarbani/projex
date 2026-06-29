import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { TrashIcon, PencilIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { deleteTask } from '../store/taskSlice';
import toast from 'react-hot-toast';

const TaskCard = ({ task, onEdit, onView }) => {
  const dispatch = useDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🗑️ Delete clicked for task ID:', task._id);
    if (!window.confirm('Delete this task?')) return;
    try {
      await dispatch(deleteTask(task._id)).unwrap();
      toast.success('Task deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) onEdit(task);
  };

  const handleCardClick = () => {
    // Only open detail if not dragging and onView exists
    if (!isDragging && onView) {
      onView(task);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow mb-3 group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle – ONLY this part triggers drag */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={(e) => e.stopPropagation()} // Prevent card click when dragging handle
        >
          <Bars3Icon className="w-5 h-5" />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-gray-900 dark:text-white pr-2">
              {task.title}
            </h4>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColor[task.priority] || 'bg-gray-100'}`}>
              {task.priority || 'medium'}
            </span>
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((user, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-700"
                    title={user.name}
                  >
                    {user.name?.charAt(0) || '?'}
                  </div>
                ))}
                {task.assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-700">
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
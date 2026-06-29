import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core'; // ✅ import useDroppable
import { useSocket } from '../hooks/useSocket';
import TaskCard from './TaskCard';
import { updateTaskStatus } from '../store/taskSlice';
import toast from 'react-hot-toast';

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

// ✅ Column component with useDroppable
const Column = ({ column, tasks, onEditTask, onViewTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      id={column.id}
      className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg min-h-[300px] transition-colors ${
        isOver ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : ''
      }`}
    >
      <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200 mb-3">
        {column.title} ({tasks.length})
      </h3>
      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEditTask}
            onView={onViewTask}
          />
        ))}
      </SortableContext>
      {tasks.length === 0 && (
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
          Drop tasks here
        </div>
      )}
    </div>
  );
};

const KanbanBoard = ({ projectId, onEditTask, onViewTask }) => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket(projectId);
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!socket) return;
    socket.on('taskUpdated', (updatedTask) => {
      setLocalTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      toast.success(`Task "${updatedTask.title}" updated`);
    });
    socket.on('taskCreated', (newTask) => {
      setLocalTasks(prev => [...prev, newTask]);
      toast.success(`New task "${newTask.title}" added`);
    });
    return () => {
      socket.off('taskUpdated');
      socket.off('taskCreated');
    };
  }, [socket]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    console.log('🔄 Drag ended - active:', active.id, 'over:', over.id);

    const taskId = active.id;
    const task = localTasks.find(t => t._id === taskId);
    if (!task) return;

    // ✅ Check if dropped on a column (now works!)
    const columnIds = columns.map(c => c.id);
    let newStatus;

    if (columnIds.includes(over.id)) {
      newStatus = over.id;
      console.log('✅ Dropped on column:', newStatus);
    } else {
      const targetTask = localTasks.find(t => t._id === over.id);
      if (!targetTask) return;
      newStatus = targetTask.status;
      console.log('✅ Dropped on task with status:', newStatus);
    }

    if (task.status === newStatus) return;

    // Optimistic update
    setLocalTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    dispatch(updateTaskStatus({ taskId, status: newStatus }))
      .unwrap()
      .catch(() => {
        setLocalTasks(prev => prev.map(t => t._id === taskId ? task : t));
        toast.error('Failed to update task status');
      });
  };

  if (!user) return <div>Loading user...</div>;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const columnTasks = localTasks.filter(t => t.status === col.id);
          return (
            <Column
              key={col.id}
              column={col}
              tasks={columnTasks}
              onEditTask={onEditTask}
              onViewTask={onViewTask}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityLogs } from '../store/activitySlice';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const ActivityLog = ({ workspaceId, projectId }) => {
  const dispatch = useDispatch();
  const { logs, isLoading } = useSelector((state) => state.activity);

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token && (workspaceId || projectId)) {
    dispatch(fetchActivityLogs({ workspaceId, projectId }));
  }
}, [dispatch, workspaceId, projectId]);


  useEffect(() => {
    dispatch(fetchActivityLogs({ workspaceId, projectId }));
  }, [dispatch, workspaceId, projectId]);

  if (isLoading) return <div className="text-gray-500">Loading activity...</div>;

  return (
    <div className="space-y-3">
      {logs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No activity yet.</p>
      ) : (
        logs.map((log) => (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-indigo-500"
          >
            <div className="flex justify-between">
              <span className="font-medium">{log.user?.name || 'Unknown'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="capitalize">{log.action}</span> {log.entityType}
              {log.details?.name && `: "${log.details.name}"`}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default ActivityLog;
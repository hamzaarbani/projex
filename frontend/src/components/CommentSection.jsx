import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/task/${taskId}`);
        setComments(res.data);
      } catch (err) {
        toast.error('Failed to load comments');
      }
    };
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await api.post(`/comments/task/${taskId}`, { text });
      setComments((prev) => [res.data, ...prev]);
      setText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">Comments</h4>
      <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
        {comments.map((c) => (
          <div key={c._id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex justify-between items-start">
            <div>
              <span className="font-semibold text-sm">{c.user?.name || 'Unknown'}: </span>
              <span className="text-sm">{c.text}</span>
              <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
            </div>
            {(c.user?._id === user?._id || user?.role === 'admin') && (
              <button
                onClick={() => handleDelete(c._id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Delete
              </button>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm">No comments yet.</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
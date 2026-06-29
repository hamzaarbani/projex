import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AttachmentUpload = ({ taskId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const res = await api.get(`/attachments/${taskId}`);
        setAttachments(res.data);
      } catch (err) {
        console.error('Fetch attachments error:', err);
      }
    };
    if (taskId) fetchAttachments();
  }, [taskId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    // ✅ Verify file object exists
    console.log('📁 Uploading file:', file.name, file.size, file.type);

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post(`/attachments/${taskId}`, formData, {
        // ✅ Ensure correct headers – axios will set multipart/form-data
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAttachments((prev) => [...prev, res.data]);
      toast.success('File uploaded!');
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/attachments/${id}`);
      setAttachments((prev) => prev.filter((a) => a._id !== id));
      toast.success('Attachment deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</p>
      <div className="space-y-1 mt-1">
        {attachments.map((a) => (
          <div key={a._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
            <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              {a.fileName}
            </a>
            <button onClick={() => handleDelete(a._id)} className="text-red-500 hover:text-red-700 text-xs">
              Delete
            </button>
          </div>
        ))}
        {attachments.length === 0 && <p className="text-gray-400 text-sm">No attachments yet.</p>}
      </div>
      <form onSubmit={handleUpload} className="flex items-center gap-2 mt-2">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-1 dark:bg-gray-700"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default AttachmentUpload;
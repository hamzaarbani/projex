const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const fs = require('fs');
const path = require('path');

exports.uploadAttachment = async (req, res) => {
  try {
    console.log('📤 Upload request for task:', req.params.taskId);
    console.log('📄 File:', req.file);

    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const attachment = await Attachment.create({
      task: taskId,
      fileUrl,
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
    });

    console.log('✅ Attachment saved:', attachment._id);
    res.status(201).json(attachment);
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttachments = async (req, res) => {
  try {
    const attachments = await Attachment.find({ task: req.params.taskId }).populate('uploadedBy', 'name');
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    const filePath = path.join(__dirname, '../uploads', path.basename(attachment.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await attachment.deleteOne();
    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
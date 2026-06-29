const Subtask = require('../models/Subtask');
const Task = require('../models/Task');

exports.createSubtask = async (req, res) => {
  try {
    const { taskId, title } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const subtask = await Subtask.create({ task: taskId, title });
    res.status(201).json(subtask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubtasksByTask = async (req, res) => {
  try {
    const subtasks = await Subtask.find({ task: req.params.taskId }).sort({ createdAt: 1 });
    res.json(subtasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleSubtask = async (req, res) => {
  try {
    const subtask = await Subtask.findById(req.params.id);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.isCompleted = !subtask.isCompleted;
    await subtask.save();
    res.json(subtask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubtask = async (req, res) => {
  try {
    const subtask = await Subtask.findById(req.params.id);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    await subtask.deleteOne();
    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
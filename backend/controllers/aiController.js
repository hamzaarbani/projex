const { summarizeTask, suggestPriority, summarizeProjectProgress } = require('../utils/ai');
const Task = require('../models/Task');
const Project = require('../models/Project');

exports.summarize = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  const summary = await summarizeTask(text);
  res.json({ summary });
};

exports.suggestPriority = async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const priority = await suggestPriority(title, description || '');
  res.json({ priority });
};

exports.progressSummary = async (req, res) => {
  const { projectId } = req.params;
  const tasks = await Task.find({ project: projectId });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const summary = await summarizeProjectProgress(project.name, tasks);
  res.json({ summary });
};
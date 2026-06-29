const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignees, projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      project: projectId,
      createdBy: req.user._id,
    });

    project.tasks.push(task._id);
    await project.save();

    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('taskCreated', task);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ This must be exported
exports.updateTaskStatus = async (req, res) => {
  console.log('🔍 updateTaskStatus called with:', req.params.id, req.body);
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('❌ Task not found');
      return res.status(404).json({ message: 'Task not found' });
    }
    task.status = status;
    task.updatedAt = Date.now();
    await task.save();
    console.log('✅ Task status updated');
    const io = req.app.get('io');
    io.to(`project-${task.project}`).emit('taskUpdated', task);
    res.json(task);
  } catch (error) {
    console.error('❌ updateTaskStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ FULL UPDATE – with logging
exports.updateTask = async (req, res) => {
  console.log('🔍 updateTask called with:', req.params.id, req.body);
  try {
    const { title, description, priority, dueDate, assignees, status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('❌ Task not found');
      return res.status(404).json({ message: 'Task not found' });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignees = assignees || task.assignees;
    if (status) task.status = status;
    task.updatedAt = Date.now();
    await task.save();
    console.log('✅ Task updated');

    const io = req.app.get('io');
    io.to(`project-${task.project}`).emit('taskUpdated', task);

    res.json(task);
  } catch (error) {
    console.error('❌ updateTask error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE – with logging
exports.deleteTask = async (req, res) => {
  console.log('🔍 deleteTask called with:', req.params.id);
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('❌ Task not found');
      return res.status(404).json({ message: 'Task not found' });
    }

    await Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } });
    await task.deleteOne();
    console.log('✅ Task deleted');

    const io = req.app.get('io');
    io.to(`project-${task.project}`).emit('taskDeleted', task._id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('❌ deleteTask error:', error);
    res.status(500).json({ message: error.message });
  }
};
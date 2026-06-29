const Project = require('../models/Project');
const Workspace = require('../models/Workspace');

exports.createProject = async (req, res) => {
  const { name, description, workspaceId } = req.body;
  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    // check if user is member/owner
    if (!workspace.members.includes(req.user._id) && workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const project = await Project.create({ name, description, workspace: workspaceId });
    workspace.projects.push(project._id);
    await workspace.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const projects = await Project.find({ workspace: workspaceId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Add update/delete similarly
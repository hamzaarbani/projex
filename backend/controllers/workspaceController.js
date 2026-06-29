const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');

exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id },
    });

    await logActivity({
      user: req.user._id,
      action: 'created',
      entityType: 'workspace',
      entityId: workspace._id,
      details: { name: workspace.name },
      workspace: workspace._id,
    });

    const io = req.app.get('io');
    io.to(`user-${req.user._id}`).emit('notification', {
      message: `You created workspace "${workspace.name}"`,
      createdAt: new Date(),
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ members: req.user._id }).populate('owner', 'name email');
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('projects');

    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (!workspace.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can update' });
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();

    await logActivity({
      user: req.user._id,
      action: 'updated',
      entityType: 'workspace',
      entityId: workspace._id,
      details: { name: workspace.name, description: workspace.description },
      workspace: workspace._id,
    });

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete' });
    }

    await logActivity({
      user: req.user._id,
      action: 'deleted',
      entityType: 'workspace',
      entityId: workspace._id,
      details: { name: workspace.name },
      workspace: workspace._id,
    });

    await workspace.deleteOne();
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (workspace.members.includes(user._id)) {
      return res.status(400).json({ message: 'User already in workspace' });
    }

    workspace.members.push(user._id);
    await workspace.save();

    await User.findByIdAndUpdate(user._id, {
      $push: { workspaces: workspace._id },
    });

    await logActivity({
      user: req.user._id,
      action: 'added_member',
      entityType: 'workspace',
      entityId: workspace._id,
      details: { memberEmail: email, memberName: user.name },
      workspace: workspace._id,
    });

    const io = req.app.get('io');
    io.to(`user-${user._id}`).emit('notification', {
      message: `You've been added to workspace "${workspace.name}"`,
      createdAt: new Date(),
    });

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can remove members' });
    }
    if (userId === workspace.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the workspace owner' });
    }

    workspace.members = workspace.members.filter(m => m.toString() !== userId);
    await workspace.save();

    const user = await User.findById(userId);
    if (user) {
      user.workspaces = user.workspaces.filter(w => w.toString() !== workspaceId);
      await user.save();
    }

    await logActivity({
      user: req.user._id,
      action: 'removed_member',
      entityType: 'workspace',
      entityId: workspace._id,
      details: { memberId: userId },
      workspace: workspace._id,
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: error.message });
  }
};
const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const { workspaceId, projectId } = req.query;
    const filter = {};
    if (workspaceId) filter.workspace = workspaceId;
    if (projectId) filter.project = projectId;
    // also ensure user is part of that workspace/project (optional authorization)

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
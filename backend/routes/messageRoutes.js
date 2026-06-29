const express = require('express');
const protect = require('../middleware/auth');
const Message = require('../models/Message');

const router = express.Router();

// @desc    Get messages for a workspace
// @route   GET /api/messages/:workspaceId
// @access  Private
router.get('/:workspaceId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ workspace: req.params.workspaceId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
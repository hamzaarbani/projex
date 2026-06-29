const express = require('express');
const protect = require('../middleware/auth');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember, // ✅ imported
} = require('../controllers/workspaceController');

const router = express.Router();

router.route('/')
  .post(protect, createWorkspace)
  .get(protect, getWorkspaces);

router.route('/:id')
  .get(protect, getWorkspace)
  .put(protect, updateWorkspace)
  .delete(protect, deleteWorkspace);

router.post('/:id/members', protect, addMember);
router.delete('/:workspaceId/members/:userId', protect, removeMember); // ✅ now defined

module.exports = router;
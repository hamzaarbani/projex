const express = require('express');
const protect = require('../middleware/auth');
const {
  createSubtask,
  getSubtasksByTask,
  toggleSubtask,
  deleteSubtask,
} = require('../controllers/subtaskController');

const router = express.Router();

router.post('/', protect, createSubtask);
router.get('/task/:taskId', protect, getSubtasksByTask);
router.put('/:id/toggle', protect, toggleSubtask);
router.delete('/:id', protect, deleteSubtask);

module.exports = router;
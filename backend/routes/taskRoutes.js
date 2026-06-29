const express = require('express');
const protect = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();


router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getTasks);
router.get('/:id', protect, getTask);
router.put('/:id/status', protect, updateTaskStatus);  // ✅ this is the endpoint your frontend calls
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);


module.exports = router;
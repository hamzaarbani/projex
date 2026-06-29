const express = require('express');
const protect = require('../middleware/auth');
const { createComment, getComments, deleteComment } = require('../controllers/commentController');
const router = express.Router();

router.post('/task/:taskId', protect, createComment);
router.get('/task/:taskId', protect, getComments);
router.delete('/:id', protect, deleteComment);

module.exports = router;
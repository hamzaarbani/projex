const express = require('express');
const protect = require('../middleware/auth');
const { summarize, suggestPriority, progressSummary } = require('../controllers/aiController');
const router = express.Router();

router.post('/summarize', protect, summarize);
router.post('/priority', protect, suggestPriority);
router.get('/progress/:projectId', protect, progressSummary);

module.exports = router;
const express = require('express');
const protect = require('../middleware/auth');
const { inviteMember, acceptInvitation } = require('../controllers/invitationController');
const router = express.Router();
router.post('/invite', protect, inviteMember);
router.get('/accept/:token', protect, acceptInvitation);
module.exports = router;
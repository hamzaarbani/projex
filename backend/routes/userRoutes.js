const express = require('express');
const protect = require('../middleware/auth');
const { updateProfile, changePassword } = require('../controllers/userController');
const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
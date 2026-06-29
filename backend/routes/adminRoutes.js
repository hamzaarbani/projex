const express = require('express');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getUsers, deleteUser, getStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/stats', protect, admin, getStats);

module.exports = router;
const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { getAllUsers, banUser, unbanUser, deleteUser } = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Get all users with pagination and filters
router.get('/users', getAllUsers);

// Ban a user (POST) and unban (DELETE)
router.post('/users/:id/ban', banUser);
router.delete('/users/:id/ban', unbanUser);

// Delete user permanently
router.delete('/users/:id', deleteUser);

module.exports = router;
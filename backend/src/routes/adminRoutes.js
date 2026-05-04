// backend/src/routes/adminRoutes.js

const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  changeUserRole,
  getLogs,        
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// User management
router.get('/users', getAllUsers);
router.post('/users/:id/ban', banUser);
router.delete('/users/:id/ban', unbanUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);

// Audit logs
router.get('/logs', getLogs);

module.exports = router;
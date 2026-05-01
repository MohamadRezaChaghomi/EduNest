const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { getAllUsers, banUser, unbanUser, deleteUser, changeUserRole } = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.post('/users/:id/ban', banUser);
router.delete('/users/:id/ban', unbanUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);

module.exports = router;
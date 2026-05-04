// backend/src/routes/orderRoutes.js

const express = require('express');
const { protect } = require('../middleware/auth');
const {
  enrollCourse,
  getMyOrders,
  getOrderById,
} = require('../controllers/orderController');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// ========== Routes ==========
router.post('/enroll', enrollCourse);
router.get('/my', getMyOrders);    // Must come before /:id to avoid conflict
router.get('/:id', getOrderById);

module.exports = router;
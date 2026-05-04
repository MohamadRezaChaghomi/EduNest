const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { enrollCourse, getMyOrders, getOrderById } = require('../controllers/orderController');

const router = express.Router();

router.post('/enroll', protect, enrollCourse);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
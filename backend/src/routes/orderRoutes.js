// orderRoutes.js
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { enrollCourse } = require('../controllers/orderController');
const router = express.Router();
router.post('/enroll', protect, enrollCourse);
module.exports = router;
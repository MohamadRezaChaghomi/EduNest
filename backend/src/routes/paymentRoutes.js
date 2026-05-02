const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { createCheckoutSession } = require('../controllers/paymentController');
const router = express.Router();
router.post('/create-checkout-session', protect, createCheckoutSession);
module.exports = router;
// backend/src/routes/paymentRoutes.js

const express = require('express');
const { protect } = require('../middleware/auth');
const { createCheckoutSession } = require('../controllers/paymentController');

const router = express.Router();

// Protected route - create Stripe checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Note: Stripe webhook endpoint is located in app.js (raw body required)

module.exports = router;
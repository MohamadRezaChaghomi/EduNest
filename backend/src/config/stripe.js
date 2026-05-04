// backend/src/config/stripe.js

const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY is not defined in environment variables');
  process.exit(1);
}

const stripe = Stripe(secretKey);
console.log('✅ Stripe configured successfully');

module.exports = stripe;
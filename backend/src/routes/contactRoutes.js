// backend/src/routes/contactRoutes.js

const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  submitContact,
  getContacts,
  markAsRead,
} = require('../controllers/contactController');

const router = express.Router();

// Public route - anyone can submit contact form
router.post('/', submitContact);

// Admin-only routes
router.get('/', protect, adminOnly, getContacts);
router.put('/:id/read', protect, adminOnly, markAsRead);

module.exports = router;
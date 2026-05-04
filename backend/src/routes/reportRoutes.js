// backend/src/routes/reportRoutes.js

const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createReport,
  getReports,
  resolveReport,
  deleteReport,
} = require('../controllers/reportController');

const router = express.Router();

// ========== Routes ==========

// Create a report (authenticated users) + Get all reports (admin only)
router.route('/')
  .post(protect, createReport)      // Any authenticated user
  .get(protect, adminOnly, getReports); // Admin only

// Resolve or delete a report (admin only)
router.route('/:id')
  .put(protect, adminOnly, resolveReport)
  .delete(protect, adminOnly, deleteReport);

module.exports = router;
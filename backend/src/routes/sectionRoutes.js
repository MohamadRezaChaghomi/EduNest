// backend/src/routes/sectionRoutes.js

const express = require('express');
const {
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ========== Public Routes ==========
router.get('/courses/:courseId/sections', getSectionsByCourse);

// ========== Protected Routes (Instructor/Admin only - authorization in controller) ==========
router.post('/courses/:courseId/sections', protect, createSection);
router.put('/sections/:id', protect, updateSection);
router.delete('/sections/:id', protect, deleteSection);

module.exports = router;
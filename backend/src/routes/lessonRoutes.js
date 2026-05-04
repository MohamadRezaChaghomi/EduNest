// backend/src/routes/lessonRoutes.js

const express = require('express');
const {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsBySection,
} = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ========== Public Routes ==========
router.get('/sections/:sectionId/lessons', getLessonsBySection);

// ========== Protected Routes (Instructor/Admin only - authorization handled in controller) ==========
router.post('/sections/:sectionId/lessons', protect, createLesson);
router.put('/lessons/:id', protect, updateLesson);
router.delete('/lessons/:id', protect, deleteLesson);

module.exports = router;
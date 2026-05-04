// backend/src/routes/courseRoutes.js

const express = require('express');
const {
  createCourse,
  getCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getAllCoursesAdmin,
  getPopularCourses,
} = require('../controllers/courseController');
const { protect, adminOnly, instructorOnly } = require('../middleware/auth');

const router = express.Router();

// ========== Public Routes ==========
router.get('/', getCourses);
router.get('/popular', getPopularCourses);
router.get('/:slug', getCourseBySlug); // slug-based lookup (must come after specific routes)

// ========== Instructor/Admin Routes ==========
router.post('/', protect, instructorOnly, createCourse);
router.get('/instructor/my-courses', protect, instructorOnly, getMyCourses);

// ========== Admin Only Routes ==========
router.get('/admin/all', protect, adminOnly, getAllCoursesAdmin);

// ========== ID-based Routes (with authorization) ==========
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

module.exports = router;
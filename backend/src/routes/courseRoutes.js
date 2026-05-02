const express = require('express');
const { createCourse, getCourses, getCourseBySlug, updateCourse, deleteCourse, getMyCourses } = require('../controllers/courseController');
const { protect, instructorOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, instructorOnly, createCourse);

router.get('/instructor/my-courses', protect, instructorOnly, getMyCourses);
router.get('/:slug', getCourseBySlug);
router.route('/:id')
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;
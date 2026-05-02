import express from 'express';
import {
  createCourse, getCourses, getCourseBySlug,
  updateCourse, deleteCourse, getMyCourses,
} from '../controllers/courseController.js';
import { protect, instructorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, instructorOnly, createCourse);

router.get('/instructor/my-courses', protect, instructorOnly, getMyCourses);
router.get('/:slug', getCourseBySlug);
router.route('/:id')
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

export default router;
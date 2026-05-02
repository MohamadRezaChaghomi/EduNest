import express from 'express';
import {
  createLesson, updateLesson, deleteLesson, getLessonsBySection,
} from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/sections/:sectionId/lessons', getLessonsBySection);
router.post('/sections/:sectionId/lessons', protect, createLesson);
router.route('/lessons/:id')
  .put(protect, updateLesson)
  .delete(protect, deleteLesson);

export default router;
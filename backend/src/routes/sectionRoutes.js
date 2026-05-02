import express from 'express';
import {
  createSection, getSectionsByCourse,
  updateSection, deleteSection,
} from '../controllers/sectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/courses/:courseId/sections')
  .get(getSectionsByCourse)
  .post(protect, createSection);

router.route('/sections/:id')
  .put(protect, updateSection)
  .delete(protect, deleteSection);

export default router;
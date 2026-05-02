import express from 'express';
import {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  toggleLike,
  approveReview,
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.get('/course/:courseId', getCourseReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.post('/:id/like', protect, toggleLike);
router.put('/:id/approve', protect, adminOnly, approveReview);

export default router;
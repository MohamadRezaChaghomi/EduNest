// backend/src/routes/reviewRoutes.js

const express = require('express');
const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  toggleLike,
  approveReview,
  pinReview,
  markOfficial,
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ========== Public Routes ==========
router.get('/course/:courseId', getCourseReviews);

// ========== Protected Routes (Authenticated Users) ==========
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/pin', protect, pinReview);       // Instructor or admin (checked in controller)
router.post('/:id/official', protect, markOfficial); // Instructor or admin (checked in controller)

// ========== Admin Only Routes ==========
router.put('/:id/approve', protect, adminOnly, approveReview);

module.exports = router;
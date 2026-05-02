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
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.get('/course/:courseId', getCourseReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.post('/:id/like', protect, toggleLike);
router.put('/:id/approve', protect, adminOnly, approveReview);
router.post('/:id/pin', protect, pinReview);
router.post('/:id/official', protect, markOfficial);

module.exports = router;
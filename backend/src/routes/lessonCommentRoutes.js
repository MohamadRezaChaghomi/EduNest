const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  createComment,
  getCommentsByLesson,
  updateComment,
  deleteComment,
  toggleLike,
  approveComment,
} = require('../controllers/lessonCommentController');

const router = express.Router();

router.route('/')
  .post(protect, createComment);

router.get('/lesson/:lessonId', getCommentsByLesson);

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

router.post('/:id/like', protect, toggleLike);
router.put('/:id/approve', protect, adminOnly, approveComment);

module.exports = router;
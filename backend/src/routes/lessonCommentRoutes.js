// backend/src/routes/lessonCommentRoutes.js

const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createComment,
  getCommentsByLesson,
  updateComment,
  deleteComment,
  toggleLike,
  approveComment,
} = require('../controllers/lessonCommentController');

const router = express.Router();

// ========== Public Routes ==========
router.get('/lesson/:lessonId', getCommentsByLesson);

// ========== Protected Routes (Authenticated Users) ==========
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleLike);

// ========== Admin Only Routes ==========
router.put('/:id/approve', protect, adminOnly, approveComment);

module.exports = router;
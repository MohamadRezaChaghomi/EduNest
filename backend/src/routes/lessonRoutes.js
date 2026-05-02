const express = require('express');
const { createLesson, updateLesson, deleteLesson, getLessonsBySection } = require('../controllers/lessonController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/sections/:sectionId/lessons', getLessonsBySection);
router.post('/sections/:sectionId/lessons', protect, createLesson);
router.route('/lessons/:id')
  .put(protect, updateLesson)
  .delete(protect, deleteLesson);

module.exports = router;
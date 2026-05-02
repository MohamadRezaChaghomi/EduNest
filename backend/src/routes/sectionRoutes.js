const express = require('express');
const { createSection, getSectionsByCourse, updateSection, deleteSection } = require('../controllers/sectionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/courses/:courseId/sections')
  .get(getSectionsByCourse)
  .post(protect, createSection);

router.route('/sections/:id')
  .put(protect, updateSection)
  .delete(protect, deleteSection);

module.exports = router;
// backend/src/routes/uploadRoutes.js

const express = require('express');
const { upload } = require('../middleware/upload'); // corrected path and filename
const { uploadCourseCover, uploadLessonVideo } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes (instructor/admin only - authorization in controller)
router.post('/courses/:courseId/cover', protect, upload.single('cover'), uploadCourseCover);
router.post('/lessons/:lessonId/video', protect, upload.single('video'), uploadLessonVideo);

module.exports = router;
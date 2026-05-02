const express = require('express');
const { upload } = require('../middlewares/uploadMiddleware');
const { uploadCourseCover, uploadLessonVideo } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/courses/:courseId/cover', protect, upload.single('cover'), uploadCourseCover);
router.post('/lessons/:lessonId/video', protect, upload.single('video'), uploadLessonVideo);

module.exports = router;
import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadCourseCover, uploadLessonVideo } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// آپلود کاور دوره – فیلد name باید "cover" باشد
router.post('/courses/:courseId/cover', protect, upload.single('cover'), uploadCourseCover);

// آپلود ویدیوی درس – فیلد name باید "video" باشد
router.post('/lessons/:lessonId/video', protect, upload.single('video'), uploadLessonVideo);

export default router;
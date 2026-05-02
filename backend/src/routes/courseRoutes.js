const express = require('express');
const {
  createCourse,
  getCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getAllCoursesAdmin,
  getPopularCourses,
} = require('../controllers/courseController');
const { protect, adminOnly, instructorOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// مسیرهای عمومی
router.get('/', getCourses);
router.get('/popular', getPopularCourses);
router.get('/:slug', getCourseBySlug);

// مسیرهای محافظت شده برای مدرس/ادمین
router.post('/', protect, instructorOnly, createCourse);
router.get('/instructor/my-courses', protect, instructorOnly, getMyCourses);

// مسیرهای ادمین (باید قبل از /:slug بیاید تا تداخل نداشته باشد)
router.get('/admin/all', protect, adminOnly, getAllCoursesAdmin);

// مسیرهای عمومی با پارامتر id (توجه: مسیر /:slug قبل از این تعریف شده، پس اینها برای id هستند)
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

module.exports = router;
import cloudinary from '../config/cloudinary.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

// آپلود کاور دوره
export const uploadCourseCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'فایلی ارسال نشده است' });
    
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'دوره پیدا نشد' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    // آپلود به Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `edunest/courses/${courseId}/cover`,
          transformation: [{ width: 800, height: 450, crop: 'fill' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    course.coverImage = result.secure_url;
    await course.save();
    res.json({ message: 'کاور با موفقیت آپلود شد', url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// آپلود ویدیوی درس
export const uploadLessonVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'فایلی ارسال نشده است' });
    
    const lessonId = req.params.lessonId;
    const lesson = await Lesson.findById(lessonId)
      .populate({ path: 'section', populate: { path: 'course' } });
    if (!lesson) return res.status(404).json({ message: 'درس پیدا نشد' });
    const course = lesson.section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    // آپلود به Cloudinary (با تنظیم برای ویدیو)
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `edunest/courses/${course._id}/lessons/${lessonId}`,
          resource_type: 'video',
          eager: [{ width: 1280, height: 720, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    lesson.videoUrl = result.secure_url;
    lesson.videoDuration = Math.round(result.duration || 0);
    await lesson.save();
    res.json({ message: 'ویدیو با موفقیت آپلود شد', url: result.secure_url, duration: lesson.videoDuration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
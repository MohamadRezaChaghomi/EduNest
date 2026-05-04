// backend/src/controllers/uploadController.js

const cloudinary = require('../config/cloudinary');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

/**
 * Upload course cover image
 * POST /api/upload/courses/:courseId/cover
 * Access: Instructor or Admin
 */
exports.uploadCourseCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to upload cover for this course.',
      });
    }

    // Upload to Cloudinary
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

    res.json({
      success: true,
      message: 'Course cover uploaded successfully.',
      data: { url: result.secure_url },
    });
  } catch (error) {
    console.error('Upload course cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Upload lesson video
 * POST /api/upload/lessons/:lessonId/video
 * Access: Instructor or Admin
 */
exports.uploadLessonVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.',
      });
    }

    const course = lesson.section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to upload video for this lesson.',
      });
    }

    // Upload to Cloudinary with video settings
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

    res.json({
      success: true,
      message: 'Lesson video uploaded successfully.',
      data: {
        url: result.secure_url,
        duration: lesson.videoDuration,
      },
    });
  } catch (error) {
    console.error('Upload lesson video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
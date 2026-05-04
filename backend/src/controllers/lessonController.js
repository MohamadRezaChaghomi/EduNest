// backend/src/controllers/lessonController.js

const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const Course = require('../models/Course');

/**
 * Create a new lesson inside a section
 * POST /api/sections/:sectionId/lessons
 * Access: Instructor or Admin
 */
exports.createLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, videoDuration, isFree, order } = req.body;
    const { sectionId } = req.params;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Lesson title is required.',
      });
    }

    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found.',
      });
    }

    const course = section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create lesson in this course.',
      });
    }

    const lesson = await Lesson.create({
      title,
      description: description || '',
      videoUrl: videoUrl || '',
      videoDuration: videoDuration || 0,
      isFree: isFree || false,
      order: order || 0,
      section: section._id,
    });

    await Course.findByIdAndUpdate(course._id, { $inc: { totalLessons: 1 } });

    res.status(201).json({
      success: true,
      data: lesson,
      message: 'Lesson created successfully.',
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Update an existing lesson
 * PUT /api/lessons/:id
 * Access: Instructor or Admin
 */
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, videoDuration, isFree, order } = req.body;

    const lesson = await Lesson.findById(id).populate({
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
        message: 'Unauthorized to update this lesson.',
      });
    }

    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (videoDuration !== undefined) lesson.videoDuration = videoDuration;
    if (isFree !== undefined) lesson.isFree = isFree;
    if (order !== undefined) lesson.order = order;

    await lesson.save();

    res.json({
      success: true,
      data: lesson,
      message: 'Lesson updated successfully.',
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a lesson
 * DELETE /api/lessons/:id
 * Access: Instructor or Admin
 */
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id).populate({
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
        message: 'Unauthorized to delete this lesson.',
      });
    }

    await lesson.deleteOne();
    await Course.findByIdAndUpdate(course._id, { $inc: { totalLessons: -1 } });

    res.json({
      success: true,
      message: 'Lesson deleted successfully.',
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get all lessons of a section (public)
 * GET /api/sections/:sectionId/lessons
 * Access: Public (but in practice, course access may be checked elsewhere)
 */
exports.getLessonsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID is required.',
      });
    }

    const lessons = await Lesson.find({ section: sectionId }).sort('order');

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Get lessons by section error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
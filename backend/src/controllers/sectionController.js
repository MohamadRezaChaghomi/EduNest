// backend/src/controllers/sectionController.js

const Section = require('../models/Section');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

/**
 * Create a new section inside a course
 * POST /api/courses/:courseId/sections
 * Access: Instructor or Admin
 */
exports.createSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    const { courseId } = req.params;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Section title is required.',
      });
    }

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
        message: 'Unauthorized to create section in this course.',
      });
    }

    const section = await Section.create({
      title,
      order: order || 0,
      course: course._id,
    });

    res.status(201).json({
      success: true,
      data: section,
      message: 'Section created successfully.',
    });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get all sections of a course (with lessons populated)
 * GET /api/courses/:courseId/sections
 * Access: Public (but may check enrollment in controller/course if needed)
 */
exports.getSectionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required.',
      });
    }

    const sections = await Section.find({ course: courseId })
      .sort('order')
      .populate('lessons');

    res.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error('Get sections by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Update a section (title, order)
 * PUT /api/sections/:id
 * Access: Instructor or Admin
 */
exports.updateSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    const { id } = req.params;

    const section = await Section.findById(id).populate('course');
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
        message: 'Unauthorized to update this section.',
      });
    }

    if (title !== undefined) section.title = title;
    if (order !== undefined) section.order = order;
    await section.save();

    res.json({
      success: true,
      data: section,
      message: 'Section updated successfully.',
    });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a section and all its lessons
 * DELETE /api/sections/:id
 * Access: Instructor or Admin
 */
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findById(id).populate('course');
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
        message: 'Unauthorized to delete this section.',
      });
    }

    // Delete all lessons inside this section
    await Lesson.deleteMany({ section: section._id });
    await section.deleteOne();

    res.json({
      success: true,
      message: 'Section and its lessons deleted successfully.',
    });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
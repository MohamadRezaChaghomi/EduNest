// backend/src/controllers/lessonCommentController.js

const LessonComment = require('../models/LessonComment');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

/**
 * Check if user has access to the lesson (enrolled student, instructor, or admin)
 * @returns {Promise<Object>} course object
 */
const checkLessonAccess = async (userId, userRole, lessonId) => {
  const lesson = await Lesson.findById(lessonId).populate('section');
  if (!lesson) throw new Error('Lesson not found');

  const course = await Course.findById(lesson.section.course);
  if (!course) throw new Error('Course not found');

  const isStudent = course.students && course.students.includes(userId);
  const isInstructor = course.instructor.toString() === userId;
  const isAdmin = userRole === 'admin';

  if (!isStudent && !isInstructor && !isAdmin) {
    throw new Error('You do not have access to this lesson');
  }
  return course;
};

/**
 * Create a new comment or reply on a lesson
 * POST /api/lesson-comments
 * Access: Private (enrolled students, instructor, admin)
 */
exports.createComment = async (req, res) => {
  try {
    const { lessonId, comment, parentComment } = req.body;

    if (!lessonId || !comment) {
      return res.status(400).json({
        success: false,
        message: 'lessonId and comment are required.',
      });
    }

    await checkLessonAccess(req.user.id, req.user.role, lessonId);

    if (parentComment) {
      const parent = await LessonComment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found.',
        });
      }
      if (parent.parentComment) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reply to a reply.',
        });
      }
    }

    const newComment = await LessonComment.create({
      user: req.user.id,
      lesson: lessonId,
      comment,
      parentComment: parentComment || null,
    });

    await newComment.populate('user', 'name email profileImage');

    res.status(201).json({
      success: true,
      data: newComment,
      message: 'Comment created successfully.',
    });
  } catch (error) {
    console.error('Create comment error:', error);
    const status = error.message.includes('not found') || error.message.includes('access') ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message === 'Lesson not found' || error.message === 'Course not found'
        ? error.message
        : 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get all approved comments for a lesson (with pagination and replies)
 * GET /api/lesson-comments/lesson/:lessonId
 * Access: Public (but can be restricted if needed)
 */
exports.getCommentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'lessonId is required.',
      });
    }

    const comments = await LessonComment.find({
      lesson: lessonId,
      parentComment: null,
      isApproved: true,
    })
      .populate('user', 'name email profileImage')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name email profileImage' },
        options: { sort: { createdAt: 1 } },
      })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LessonComment.countDocuments({
      lesson: lessonId,
      parentComment: null,
      isApproved: true,
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get comments by lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Update a comment (owner or admin only)
 * PUT /api/lesson-comments/:id
 * Access: Private
 */
exports.updateComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required.',
      });
    }

    const lessonComment = await LessonComment.findById(req.params.id);
    if (!lessonComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    if (lessonComment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this comment.',
      });
    }

    lessonComment.comment = comment;
    lessonComment.editedAt = new Date();
    await lessonComment.save();

    res.json({
      success: true,
      data: lessonComment,
      message: 'Comment updated successfully.',
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a comment (owner or admin) - also deletes all its replies
 * DELETE /api/lesson-comments/:id
 * Access: Private
 */
exports.deleteComment = async (req, res) => {
  try {
    const lessonComment = await LessonComment.findById(req.params.id);
    if (!lessonComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    if (lessonComment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this comment.',
      });
    }

    if (!lessonComment.parentComment) {
      // Delete all replies to this comment
      await LessonComment.deleteMany({ parentComment: lessonComment._id });
    }
    await lessonComment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Like / Unlike a comment
 * POST /api/lesson-comments/:id/like
 * Access: Private
 */
exports.toggleLike = async (req, res) => {
  try {
    const comment = await LessonComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const userId = req.user.id;
    const liked = comment.likes.includes(userId);

    if (liked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();

    res.json({
      success: true,
      liked: !liked,
      likesCount: comment.likes.length,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Approve a comment (Admin only)
 * PUT /api/lesson-comments/:id/approve
 * Access: Private (Admin)
 */
exports.approveComment = async (req, res) => {
  try {
    const comment = await LessonComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    comment.isApproved = true;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment approved successfully.',
    });
  } catch (error) {
    console.error('Approve comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
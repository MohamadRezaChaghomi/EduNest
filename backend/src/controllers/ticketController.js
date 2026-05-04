// backend/src/controllers/ticketController.js

const Ticket = require('../models/Ticket');
const Course = require('../models/Course');

/**
 * Check if user has access to the course (for ticket creation)
 * @returns {Promise<Object>} course object
 */
const checkCourseAccess = async (userId, userRole, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');

  const isStudent = course.students && course.students.includes(userId);
  const isInstructor = course.instructor.toString() === userId;
  const isAdmin = userRole === 'admin';

  if (!isStudent && !isInstructor && !isAdmin) {
    throw new Error('You do not have access to this course');
  }
  return course;
};

/**
 * Create a new support ticket
 * POST /api/tickets
 * Access: Private (enrolled student, instructor, or admin)
 */
exports.createTicket = async (req, res) => {
  try {
    const { courseId, subject, message, priority } = req.body;

    if (!courseId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, subject, and message are required.',
      });
    }

    await checkCourseAccess(req.user.id, req.user.role, courseId);

    const ticket = await Ticket.create({
      user: req.user.id,
      course: courseId,
      subject,
      priority: priority || 'medium',
      messages: [{
        sender: req.user.id,
        message,
        isStaffReply: false,
      }],
    });

    await ticket.populate('user', 'name email profileImage');

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully.',
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    const status = error.message === 'Course not found' ? 404 : 403;
    res.status(status).json({
      success: false,
      message: error.message === 'Course not found' ? 'Course not found.' : error.message,
    });
  }
};

/**
 * Get tickets based on user role
 * - Admin: all tickets
 * - Instructor: tickets of their own courses
 * - User: own tickets
 * GET /api/tickets
 * Access: Private
 */
exports.getTickets = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'admin') {
      // Admin sees all tickets
    } else if (req.user.role === 'instructor') {
      // Instructor sees tickets for their courses
      const courses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = courses.map(c => c._id);
      filter.course = { $in: courseIds };
    } else {
      // Regular user sees only their own tickets
      filter.user = req.user.id;
    }

    const tickets = await Ticket.find(filter)
      .populate('user', 'name email profileImage')
      .populate('course', 'title slug')
      .populate('messages.sender', 'name role profileImage')
      .sort('-createdAt');

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get ticket details by ID (with access control)
 * GET /api/tickets/:id
 * Access: Private (owner, instructor, or admin)
 */
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate('user', 'name email profileImage')
      .populate('course', 'title slug')
      .populate('messages.sender', 'name role profileImage');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Check access
    const course = await Course.findById(ticket.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const isOwner = ticket.user._id.toString() === req.user.id;
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this ticket.',
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Add a new message to a ticket
 * POST /api/tickets/:id/messages
 * Access: Private (owner, instructor, admin)
 */
exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required.',
      });
    }

    const ticket = await Ticket.findById(id).populate('course');
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    const course = ticket.course;
    const isOwner = ticket.user.toString() === req.user.id;
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to add message to this ticket.',
      });
    }

    const isStaff = isInstructor || isAdmin;
    ticket.messages.push({
      sender: req.user.id,
      message,
      isStaffReply: isStaff,
    });

    // Reopen ticket if it was closed
    if (ticket.status === 'closed') {
      ticket.status = 'open';
      ticket.closedAt = null;
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'name role profileImage');

    res.json({
      success: true,
      data: ticket,
      message: 'Message added successfully.',
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Update ticket status (open, in_progress, closed)
 * PUT /api/tickets/:id/status
 * Access: Private (instructor or admin)
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['open', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: open, in_progress, closed.',
      });
    }

    const ticket = await Ticket.findById(id).populate('course');
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    const course = ticket.course;
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can change ticket status.',
      });
    }

    ticket.status = status;
    if (status === 'closed') {
      ticket.closedAt = new Date();
    } else {
      ticket.closedAt = null;
    }
    await ticket.save();

    res.json({
      success: true,
      data: ticket,
      message: `Ticket status updated to ${status}.`,
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a ticket (Admin only)
 * DELETE /api/tickets/:id
 * Access: Private (admin)
 */
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    await ticket.deleteOne();

    res.json({
      success: true,
      message: 'Ticket deleted successfully.',
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
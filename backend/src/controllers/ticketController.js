const Ticket = require('../models/Ticket');
const Course = require('../models/Course');

// بررسی دسترسی کاربر به دوره (برای ایجاد تیکت)
const checkCourseAccess = async (userId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error('دوره یافت نشد');
  const isStudent = course.students.includes(userId);
  const isInstructor = course.instructor.toString() === userId;
  const isAdmin = false; // بعداً نقش را چک کنید
  if (!isStudent && !isInstructor && !isAdmin) {
    throw new Error('شما دسترسی به این دوره ندارید');
  }
  return course;
};

// @desc    ایجاد تیکت جدید
// @route   POST /api/tickets
// @access  Private (فقط دانشجوی آن دوره یا مدرس/ادمین)
exports.createTicket = async (req, res) => {
  try {
    const { courseId, subject, message, priority } = req.body;
    await checkCourseAccess(req.user.id, courseId);

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
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    دریافت تیکت‌های کاربر جاری (یا همه تیکت‌ها برای ادمین/مدرس)
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      // ادمین همه تیکت‌ها را می‌بیند
    } else if (req.user.role === 'instructor') {
      // مدرس تیکت‌های دوره‌های خودش را می‌بیند
      const courses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = courses.map(c => c._id);
      filter.course = { $in: courseIds };
    } else {
      // کاربر عادی فقط تیکت‌های خودش
      filter.user = req.user.id;
    }

    const tickets = await Ticket.find(filter)
      .populate('user', 'name email profileImage')
      .populate('course', 'title slug')
      .populate('messages.sender', 'name role profileImage')
      .sort('-createdAt');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    دریافت جزئیات یک تیکت (با دسترسی)
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email profileImage')
      .populate('course', 'title slug')
      .populate('messages.sender', 'name role profileImage');
    if (!ticket) return res.status(404).json({ message: 'تیکت پیدا نشد' });

    // بررسی دسترسی
    const course = await Course.findById(ticket.course);
    const isOwner = ticket.user.toString() === req.user.id;
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    // اگر کاربر عادی است و پیام جدید وجود دارد، وضعیت خوانده شدن را به‌روز نکنید (اختیاری)
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    افزودن پیام به تیکت
// @route   POST /api/tickets/:id/messages
// @access  Private (شرکت‌کننده‌های مجاز)
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate('course');
    if (!ticket) return res.status(404).json({ message: 'تیکت پیدا نشد' });

    const course = ticket.course;
    const isOwner = ticket.user.toString() === req.user.id;
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const isStaff = (isInstructor || isAdmin);
    ticket.messages.push({
      sender: req.user.id,
      message,
      isStaffReply: isStaff,
    });

    // اگر تیکت بسته بوده و دوباره پیام داده شود، وضعیت را باز کن
    if (ticket.status === 'closed') {
      ticket.status = 'open';
      ticket.closedAt = null;
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'name role profileImage');
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تغییر وضعیت تیکت (ادمین یا مدرس)
// @route   PUT /api/tickets/:id/status
// @access  Private (instructor/admin)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body; // open, in_progress, closed
    const ticket = await Ticket.findById(req.params.id).populate('course');
    if (!ticket) return res.status(404).json({ message: 'تیکت پیدا نشد' });

    const course = ticket.course;
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'فقط مدرس یا ادمین می‌تواند وضعیت را تغییر دهد' });
    }

    ticket.status = status;
    if (status === 'closed') ticket.closedAt = new Date();
    else ticket.closedAt = null;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف تیکت (فقط ادمین)
// @route   DELETE /api/tickets/:id
// @access  Private (admin only)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'تیکت پیدا نشد' });
    await ticket.deleteOne();
    res.json({ message: 'تیکت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
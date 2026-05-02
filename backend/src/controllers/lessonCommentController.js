const LessonComment = require('../models/LessonComment');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// بررسی دسترسی کاربر به درس (فقط دانشجویانی که دوره را خریداری کرده‌اند یا مدرس/ادمین)
const checkLessonAccess = async (userId, lessonId) => {
  const lesson = await Lesson.findById(lessonId).populate('section');
  if (!lesson) throw new Error('درس یافت نشد');
  const course = await Course.findById(lesson.section.course);
  if (!course) throw new Error('دوره یافت نشد');
  const isStudent = course.students.includes(userId);
  const isInstructor = course.instructor.toString() === userId;
  const isAdmin = false; // بعداً role را چک کنید
  if (!isStudent && !isInstructor && !isAdmin) {
    throw new Error('شما دسترسی به این درس ندارید');
  }
  return course;
};

// @desc    ایجاد کامنت جدید روی درس (اصلی یا ریپلای)
// @route   POST /api/lesson-comments
// @access  Private (دانشجویانی که درس را دسترسی دارند)
exports.createComment = async (req, res) => {
  try {
    const { lessonId, comment, parentComment } = req.body;
    await checkLessonAccess(req.user.id, lessonId);
    
    if (parentComment) {
      const parent = await LessonComment.findById(parentComment);
      if (!parent) return res.status(404).json({ message: 'کامنت اصلی یافت نشد' });
      if (parent.parentComment) return res.status(400).json({ message: 'نمی‌توان به یک ریپلای پاسخ داد' });
    }

    const newComment = await LessonComment.create({
      user: req.user.id,
      lesson: lessonId,
      comment,
      parentComment: parentComment || null,
    });
    await newComment.populate('user', 'name email profileImage');
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    دریافت کامنت‌های یک درس (همراه با ریپلای‌ها و لایک)
// @route   GET /api/lesson-comments/lesson/:lessonId
// @access  Public (اما بهتر است بررسی دسترسی شود – اختیاری)
exports.getCommentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const comments = await LessonComment.find({ lesson: lessonId, parentComment: null, isApproved: true })
      .populate('user', 'name email profileImage')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name email profileImage' },
        options: { sort: { createdAt: 1 } }
      })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await LessonComment.countDocuments({ lesson: lessonId, parentComment: null, isApproved: true });
    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ویرایش کامنت (فقط مالک یا ادمین)
// @route   PUT /api/lesson-comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const lessonComment = await LessonComment.findById(req.params.id);
    if (!lessonComment) return res.status(404).json({ message: 'کامنت پیدا نشد' });
    if (lessonComment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    lessonComment.comment = comment;
    lessonComment.editedAt = new Date();
    await lessonComment.save();
    res.json(lessonComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف کامنت (مالک یا ادمین) – ریپلای‌ها نیز حذف می‌شوند
// @route   DELETE /api/lesson-comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const lessonComment = await LessonComment.findById(req.params.id);
    if (!lessonComment) return res.status(404).json({ message: 'کامنت پیدا نشد' });
    if (lessonComment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    if (!lessonComment.parentComment) {
      await LessonComment.deleteMany({ parentComment: lessonComment._id });
    }
    await lessonComment.deleteOne();
    res.json({ message: 'کامنت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    لایک/آنلایک کامنت
// @route   POST /api/lesson-comments/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const comment = await LessonComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'کامنت پیدا نشد' });
    const userId = req.user.id;
    const liked = comment.likes.includes(userId);
    if (liked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();
    res.json({ liked: !liked, likesCount: comment.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تأیید کامنت توسط ادمین (اختیاری)
// @route   PUT /api/lesson-comments/:id/approve
// @access  Private (Admin only)
exports.approveComment = async (req, res) => {
  try {
    const comment = await LessonComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'کامنت پیدا نشد' });
    comment.isApproved = true;
    await comment.save();
    res.json({ message: 'کامنت تأیید شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
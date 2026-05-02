import Review from '../models/Review.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// محاسبه میانگین امتیازات یک دوره و به‌روزرسانی
const updateCourseRating = async (courseId) => {
  const result = await Review.aggregate([
    { $match: { course: courseId, rating: { $exists: true, $ne: null }, parentReview: null } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const avg = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
  const count = result.length > 0 ? result[0].count : 0;
  await Course.findByIdAndUpdate(courseId, { ratingAverage: avg, ratingCount: count });
};

// @desc    افزودن نظر جدید (اصلی یا ریپلای)
// @route   POST /api/reviews
// @access  Private (فقط کاربرانی که دوره را خریداری کرده‌اند می‌توانند نظر اصلی بدهند – بعداً اضافه می‌شود)
export const createReview = async (req, res) => {
  try {
    const { course, rating, comment, parentReview } = req.body;
    const userId = req.user.id;

    // بررسی خرید دوره (ساده: فقط بررسی کنید کاربر در آرایه students دوره است)
    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: 'دوره پیدا نشد' });
    
    if (!parentReview) {
      // نظر اصلی: نیاز به امتیاز و خرید دوره
      if (!rating) return res.status(400).json({ message: 'امتیاز الزامی است' });
      const hasPurchased = courseDoc.students.includes(userId);
      if (!hasPurchased && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'شما این دوره را خریداری نکرده‌اید، نمی‌توانید نظر دهید' });
      }
      // جلوگیری از چند نظر اصلی برای یک دوره از یک کاربر
      const existing = await Review.findOne({ course, user: userId, parentReview: null });
      if (existing) return res.status(400).json({ message: 'شما قبلاً برای این دوره نظر داده‌اید' });
    } else {
      // ریپلای: بررسی وجود نظر والد و جلوگیری از ریپلای روی ریپلای (اختیاری)
      const parent = await Review.findById(parentReview);
      if (!parent) return res.status(404).json({ message: 'نظر اصلی یافت نشد' });
      if (parent.parentReview) return res.status(400).json({ message: 'نمی‌توان به یک ریپلای پاسخ داد' });
    }

    const review = await Review.create({
      user: userId,
      course,
      rating: parentReview ? undefined : rating,
      comment,
      parentReview: parentReview || null,
    });

    // اگر نظر اصلی بود، میانگین امتیاز را به‌روز کن
    if (!parentReview) {
      await updateCourseRating(course);
    }

    // populate اطلاعات کاربر برای پاسخ
    await review.populate('user', 'name role');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    دریافت نظرات یک دوره (همراه با ریپلای‌ها و لایک‌ها)
// @route   GET /api/reviews/course/:courseId
// @access  Public
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ course: courseId, parentReview: null, isApproved: true })
      .populate('user', 'name role')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name role' },
      })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ course: courseId, parentReview: null, isApproved: true });
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ویرایش نظر (فقط مالک یا ادمین)
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    if (comment) review.comment = comment;
    if (rating !== undefined && !review.parentReview) review.rating = rating;
    await review.save();
    
    if (!review.parentReview) await updateCourseRating(review.course);
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف نظر (مالک یا ادمین) – ریپلای‌ها نیز حذف می‌شوند
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    
    // حذف تمام ریپلای‌های این نظر (اگر نظر اصلی باشد)
    if (!review.parentReview) {
      await Review.deleteMany({ parentReview: review._id });
    }
    await review.deleteOne();
    
    if (!review.parentReview) await updateCourseRating(review.course);
    
    res.json({ message: 'نظر حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    لایک/آنلایک کردن نظر
// @route   POST /api/reviews/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    
    const userId = req.user.id;
    const liked = review.likes.includes(userId);
    if (liked) {
      review.likes = review.likes.filter(id => id.toString() !== userId);
    } else {
      review.likes.push(userId);
    }
    await review.save();
    res.json({ liked: !liked, likesCount: review.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تایید نظر توسط ادمین (اختیاری)
// @route   PUT /api/reviews/:id/approve
// @access  Private (Admin only)
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    review.isApproved = true;
    await review.save();
    if (!review.parentReview) await updateCourseRating(review.course);
    res.json({ message: 'نظر تایید شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
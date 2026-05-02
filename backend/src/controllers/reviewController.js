const Review = require('../models/Review');
const Course = require('../models/Course');

// به‌روزرسانی میانگین امتیاز با یک رقم اعشار
const updateCourseRating = async (courseId) => {
  const result = await Review.aggregate([
    { $match: { course: courseId, rating: { $exists: true, $ne: null }, parentReview: null, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const avg = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
  const count = result.length > 0 ? result[0].count : 0;
  await Course.findByIdAndUpdate(courseId, { ratingAverage: avg, ratingCount: count });
};

// محدودیت ضد اسپم: حداکثر ۳ نظر اصلی در ۲۴ ساعت برای هر دوره
const checkSpamLimit = async (userId, courseId) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await Review.countDocuments({
    user: userId,
    course: courseId,
    parentReview: null,
    createdAt: { $gte: twentyFourHoursAgo }
  });
  if (count >= 3) throw new Error('شما بیش از حد مجاز نظر داده‌اید. لطفاً ۲۴ ساعت صبر کنید.');
};

// ایجاد نظر (اصلی یا ریپلای) با ضد اسپم
exports.createReview = async (req, res) => {
  try {
    const { course, rating, comment, parentReview } = req.body;
    const userId = req.user.id;
    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: 'دوره پیدا نشد' });

    if (!parentReview) {
      if (!rating) return res.status(400).json({ message: 'امتیاز الزامی است' });
      const hasPurchased = courseDoc.students.includes(userId);
      if (!hasPurchased && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'شما این دوره را خریداری نکرده‌اید' });
      }
      const existing = await Review.findOne({ course, user: userId, parentReview: null });
      if (existing) return res.status(400).json({ message: 'شما قبلاً نظر داده‌اید' });
      await checkSpamLimit(userId, course);
    } else {
      const parent = await Review.findById(parentReview);
      if (!parent) return res.status(404).json({ message: 'نظر اصلی یافت نشد' });
      if (parent.parentReview) return res.status(400).json({ message: 'نمی‌توان به ریپلای پاسخ داد' });
    }

    const review = await Review.create({
      user: userId,
      course,
      rating: parentReview ? undefined : rating,
      comment,
      parentReview: parentReview || null,
    });

    if (!parentReview) await updateCourseRating(course);

    await review.populate('user', 'name role avatar');
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دریافت نظرات با مرتب‌سازی، فیلتر، و پین شده‌ها
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, sort = 'newest', rating } = req.query;
    
    let filter = { course: courseId, parentReview: null, isApproved: true };
    if (rating && !isNaN(rating)) filter.rating = parseInt(rating);

    let reviews;
    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);

    if (sort === 'mostLiked') {
      const agg = await Review.aggregate([
        { $match: filter },
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { isPinned: -1, likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum }
      ]);
      const ids = agg.map(r => r._id);
      reviews = await Review.find({ _id: { $in: ids } })
        .populate('user', 'name role avatar')
        .populate({ path: 'replies', populate: { path: 'user', select: 'name role avatar' } });
      // حفظ ترتیب
      reviews = ids.map(id => reviews.find(r => r._id.toString() === id.toString()));
    } else {
      let sortOption = { isPinned: -1, createdAt: -1 };
      if (sort === 'highestRated') sortOption = { isPinned: -1, rating: -1, createdAt: -1 };
      else if (sort === 'newest') sortOption = { isPinned: -1, createdAt: -1 };
      
      reviews = await Review.find(filter)
        .populate('user', 'name role avatar')
        .populate({ path: 'replies', populate: { path: 'user', select: 'name role avatar' } })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);
    }

    const total = await Review.countDocuments(filter);
    res.json({
      reviews,
      totalPages: Math.ceil(total / limitNum),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ویرایش نظر (محدودیت ۳۰ دقیقه)
exports.updateReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    const now = new Date();
    const diffMinutes = (now - review.createdAt) / (1000 * 60);
    if (diffMinutes > 30 && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'فقط تا ۳۰ دقیقه بعد از ثبت نظر می‌توانید ویرایش کنید' });
    }
    if (comment) review.comment = comment;
    if (rating !== undefined && !review.parentReview) review.rating = rating;
    review.editedAt = now;
    await review.save();
    if (!review.parentReview) await updateCourseRating(review.course);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف نظر (بدون تغییر)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
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

// لایک/آنلایک
exports.toggleLike = async (req, res) => {
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

// تایید نظر توسط ادمین
exports.approveReview = async (req, res) => {
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

// پین کردن نظر (فقط مدرس دوره یا ادمین)
exports.pinReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('course');
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    const course = review.course;
    const isInstructor = course.instructor.toString() === req.user.id;
    if (!isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'فقط مدرس دوره یا ادمین می‌تواند نظر را پین کند' });
    }
    if (review.parentReview) return res.status(400).json({ message: 'نمی‌توان به ریپلای پین کرد' });
    review.isPinned = !review.isPinned;
    await review.save();
    res.json({ message: review.isPinned ? 'نظر پین شد' : 'پین برداشته شد', isPinned: review.isPinned });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// علامت‌گذاری پاسخ به عنوان رسمی (فقط مدرس دوره یا ادمین)
exports.markOfficial = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'course',
      populate: { path: 'instructor' }
    });
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });
    const course = review.course;
    const isInstructor = course.instructor._id.toString() === req.user.id;
    if (!isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'فقط مدرس دوره یا ادمین می‌تواند پاسخ رسمی ثبت کند' });
    }
    if (!review.parentReview) return res.status(400).json({ message: 'فقط پاسخ به نظر می‌تواند رسمی باشد' });
    review.isOfficial = !review.isOfficial;
    await review.save();
    res.json({ message: review.isOfficial ? 'پاسخ به عنوان رسمی ثبت شد' : 'رسمی لغو شد', isOfficial: review.isOfficial });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
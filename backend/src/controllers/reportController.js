const Report = require('../models/Report');
const Review = require('../models/Review');

// @desc    ایجاد گزارش جدید (کاربر لاگین شده)
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { reviewId, reason } = req.body;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'نظر پیدا نشد' });

    // جلوگیری از گزارش نظر خود کاربر
    if (review.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'نمی‌توانید نظر خود را گزارش دهید' });
    }

    // بررسی تکراری نبودن گزارش
    const existing = await Report.findOne({ reporter: req.user.id, review: reviewId });
    if (existing) return res.status(400).json({ message: 'شما قبلاً این نظر را گزارش کرده‌اید' });

    const report = await Report.create({
      reporter: req.user.id,
      review: reviewId,
      reason,
    });

    res.status(201).json({ message: 'گزارش شما ثبت شد، کارشناسان بررسی می‌کنند', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    دریافت لیست گزارش‌ها (ادمین)
// @route   GET /api/reports
// @access  Private (admin only)
exports.getReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = { status };
    const reports = await Report.find(filter)
      .populate('reporter', 'name email profileImage')
      .populate({
        path: 'review',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);
    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    حل گزارش (ادمین)
// @route   PUT /api/reports/:id/resolve
// @access  Private (admin)
exports.resolveReport = async (req, res) => {
  try {
    const { action, adminNote } = req.body; // action: 'delete' یا 'reject'
    const report = await Report.findById(req.params.id).populate('review');
    if (!report) return res.status(404).json({ message: 'گزارش پیدا نشد' });

    if (action === 'delete') {
      // حذف نظر مربوطه (و ریپلای‌های آن)
      const review = report.review;
      await Review.deleteMany({ parentReview: review._id });
      await review.deleteOne();
      report.status = 'resolved';
      report.adminNote = adminNote || 'نظر به دلیل تخلف حذف شد';
    } else if (action === 'reject') {
      report.status = 'rejected';
      report.adminNote = adminNote || 'گزارش نامعتبر تشخیص داده شد';
    } else {
      return res.status(400).json({ message: 'فعالیت نامعتبر' });
    }

    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    res.json({ message: `گزارش ${action === 'delete' ? 'حذف و بسته شد' : 'رد شد'}`, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف گزارش (اختیاری، ادمین)
// @route   DELETE /api/reports/:id
// @access  Private (admin)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'گزارش پیدا نشد' });
    await report.deleteOne();
    res.json({ message: 'گزارش حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
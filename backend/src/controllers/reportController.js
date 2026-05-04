// backend/src/controllers/reportController.js

const Report = require('../models/Report');
const Review = require('../models/Review');

/**
 * Create a new report for a review (logged-in user)
 * POST /api/reports
 * Access: Private
 */
exports.createReport = async (req, res) => {
  try {
    const { reviewId, reason } = req.body;

    if (!reviewId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Review ID and reason are required.',
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    // Prevent reporting own review
    if (review.user.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own review.',
      });
    }

    // Check for duplicate report
    const existing = await Report.findOne({ reporter: req.user.id, review: reviewId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review.',
      });
    }

    const report = await Report.create({
      reporter: req.user.id,
      review: reviewId,
      reason,
    });

    res.status(201).json({
      success: true,
      message: 'Your report has been submitted. Our team will review it.',
      data: report,
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get all reports with filtering (Admin only)
 * GET /api/reports
 * Access: Private (admin only)
 */
exports.getReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const filter = { status };
    const reports = await Report.find(filter)
      .populate('reporter', 'name email profileImage')
      .populate({
        path: 'review',
        populate: { path: 'user', select: 'name email profileImage' },
      })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Resolve a report (Admin only)
 * PUT /api/reports/:id/resolve
 * Access: Private (admin)
 */
exports.resolveReport = async (req, res) => {
  try {
    const { action, adminNote } = req.body; // action: 'delete' or 'reject'
    const reportId = req.params.id;

    if (!action || (action !== 'delete' && action !== 'reject')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "delete" or "reject".',
      });
    }

    const report = await Report.findById(reportId).populate('review');
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (action === 'delete') {
      // Delete the reported review and its replies
      const review = report.review;
      if (review) {
        await Review.deleteMany({ parentReview: review._id });
        await review.deleteOne();
      }
      report.status = 'resolved';
      report.adminNote = adminNote || 'Review was deleted due to violation.';
    } else if (action === 'reject') {
      report.status = 'rejected';
      report.adminNote = adminNote || 'Report was rejected as invalid.';
    }

    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    res.json({
      success: true,
      message: `Report ${action === 'delete' ? 'resolved and review deleted' : 'rejected'}.`,
      data: report,
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a report (Admin only, optional)
 * DELETE /api/reports/:id
 * Access: Private (admin)
 */
exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully.',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
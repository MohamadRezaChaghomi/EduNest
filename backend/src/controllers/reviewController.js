// backend/src/controllers/reviewController.js

const Review = require('../models/Review');
const Course = require('../models/Course');

/**
 * Update course rating average (one decimal place)
 * @param {string} courseId
 */
const updateCourseRating = async (courseId) => {
  const result = await Review.aggregate([
    {
      $match: {
        course: courseId,
        rating: { $exists: true, $ne: null },
        parentReview: null,
        isApproved: true,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
  const count = result.length > 0 ? result[0].count : 0;

  await Course.findByIdAndUpdate(courseId, {
    ratingAverage: avg,
    ratingCount: count,
  });
};

/**
 * Anti-spam: max 3 main reviews per course in 24 hours
 * @param {string} userId
 * @param {string} courseId
 */
const checkSpamLimit = async (userId, courseId) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await Review.countDocuments({
    user: userId,
    course: courseId,
    parentReview: null,
    createdAt: { $gte: twentyFourHoursAgo },
  });

  if (count >= 3) {
    throw new Error('You have exceeded the review limit. Please wait 24 hours.');
  }
};

/**
 * Create a review or reply (with anti-spam)
 * POST /api/reviews
 * Access: Private (enrolled users for reviews, anyone for replies? handled in code)
 */
exports.createReview = async (req, res) => {
  try {
    const { course, rating, comment, parentReview } = req.body;
    const userId = req.user.id;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required.',
      });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Main review (not a reply)
    if (!parentReview) {
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating (1-5) is required for main review.',
        });
      }

      const hasPurchased = courseDoc.students.includes(userId);
      if (!hasPurchased && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You must purchase the course to leave a review.',
        });
      }

      const existing = await Review.findOne({
        course,
        user: userId,
        parentReview: null,
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this course.',
        });
      }

      await checkSpamLimit(userId, course);
    } else {
      // Reply to an existing review
      const parent = await Review.findById(parentReview);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent review not found.',
        });
      }
      if (parent.parentReview) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reply to a reply.',
        });
      }
    }

    const review = await Review.create({
      user: userId,
      course,
      rating: parentReview ? undefined : rating,
      comment,
      parentReview: parentReview || null,
    });

    if (!parentReview) {
      await updateCourseRating(course);
    }

    await review.populate('user', 'name role avatar');

    res.status(201).json({
      success: true,
      data: review,
      message: parentReview ? 'Reply added successfully.' : 'Review created successfully.',
    });
  } catch (error) {
    console.error('Create review error:', error);
    const status = error.message.includes('limit') ? 429 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get course reviews with filtering, sorting, and pagination
 * GET /api/reviews/course/:courseId
 * Access: Public
 */
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, sort = 'newest', rating } = req.query;

    let filter = {
      course: courseId,
      parentReview: null,
      isApproved: true,
    };
    if (rating && !isNaN(rating)) {
      filter.rating = parseInt(rating);
    }

    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);
    let reviews;

    if (sort === 'mostLiked') {
      const agg = await Review.aggregate([
        { $match: filter },
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { isPinned: -1, likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ]);
      const ids = agg.map(r => r._id);
      reviews = await Review.find({ _id: { $in: ids } })
        .populate('user', 'name role avatar')
        .populate({
          path: 'replies',
          populate: { path: 'user', select: 'name role avatar' },
        });
      // Preserve aggregation order
      reviews = ids.map(id => reviews.find(r => r._id.toString() === id.toString()));
    } else {
      let sortOption = { isPinned: -1, createdAt: -1 };
      if (sort === 'highestRated') {
        sortOption = { isPinned: -1, rating: -1, createdAt: -1 };
      } else if (sort === 'newest') {
        sortOption = { isPinned: -1, createdAt: -1 };
      }

      reviews = await Review.find(filter)
        .populate('user', 'name role avatar')
        .populate({
          path: 'replies',
          populate: { path: 'user', select: 'name role avatar' },
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);
    }

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('Get course reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Update a review (30-minute edit window)
 * PUT /api/reviews/:id
 * Access: Private (owner or admin)
 */
exports.updateReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this review.',
      });
    }

    const now = new Date();
    const diffMinutes = (now - review.createdAt) / (1000 * 60);
    if (diffMinutes > 30 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You can only edit your review within 30 minutes of posting.',
      });
    }

    if (comment) review.comment = comment;
    if (rating !== undefined && !review.parentReview) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5.',
        });
      }
      review.rating = rating;
    }
    review.editedAt = now;
    await review.save();

    if (!review.parentReview) {
      await updateCourseRating(review.course);
    }

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully.',
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a review (and its replies)
 * DELETE /api/reviews/:id
 * Access: Private (owner or admin)
 */
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this review.',
      });
    }

    if (!review.parentReview) {
      await Review.deleteMany({ parentReview: review._id });
    }
    await review.deleteOne();

    if (!review.parentReview) {
      await updateCourseRating(review.course);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Like / Unlike a review
 * POST /api/reviews/:id/like
 * Access: Private
 */
exports.toggleLike = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const liked = review.likes.includes(userId);
    if (liked) {
      review.likes = review.likes.filter(id => id.toString() !== userId);
    } else {
      review.likes.push(userId);
    }
    await review.save();

    res.json({
      success: true,
      liked: !liked,
      likesCount: review.likes.length,
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
 * Approve a review (Admin only)
 * PUT /api/reviews/:id/approve
 * Access: Private (admin)
 */
exports.approveReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    review.isApproved = true;
    await review.save();

    if (!review.parentReview) {
      await updateCourseRating(review.course);
    }

    res.json({
      success: true,
      message: 'Review approved successfully.',
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Pin/Unpin a review (Instructor or Admin)
 * PUT /api/reviews/:id/pin
 * Access: Private (instructor of course or admin)
 */
exports.pinReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId).populate('course');
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const course = review.course;
    const isInstructor = course.instructor.toString() === req.user.id;
    if (!isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can pin reviews.',
      });
    }

    if (review.parentReview) {
      return res.status(400).json({
        success: false,
        message: 'Cannot pin a reply.',
      });
    }

    review.isPinned = !review.isPinned;
    await review.save();

    res.json({
      success: true,
      message: review.isPinned ? 'Review pinned successfully.' : 'Review unpinned successfully.',
      isPinned: review.isPinned,
    });
  } catch (error) {
    console.error('Pin review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Mark a reply as official (Instructor or Admin)
 * PUT /api/reviews/:id/official
 * Access: Private (instructor of course or admin)
 */
exports.markOfficial = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId).populate({
      path: 'course',
      populate: { path: 'instructor' },
    });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const course = review.course;
    const isInstructor = course.instructor._id.toString() === req.user.id;
    if (!isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can mark replies as official.',
      });
    }

    if (!review.parentReview) {
      return res.status(400).json({
        success: false,
        message: 'Only replies can be marked as official.',
      });
    }

    review.isOfficial = !review.isOfficial;
    await review.save();

    res.json({
      success: true,
      message: review.isOfficial ? 'Reply marked as official.' : 'Official status removed.',
      isOfficial: review.isOfficial,
    });
  } catch (error) {
    console.error('Mark official error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
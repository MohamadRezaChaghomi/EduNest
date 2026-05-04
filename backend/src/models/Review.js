// backend/src/models/Review.js

const mongoose = require('mongoose');

/**
 * Review Schema for course ratings and comments
 * Supports replies, likes, pinning, and official instructor replies
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: function () {
        return !this.parentReview; // rating only required for main reviews (not replies)
      },
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
    parentReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOfficial: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for replies (sorted oldest first)
reviewSchema.virtual('replies', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'parentReview',
  options: { sort: { createdAt: 1 } },
});

// Virtual for likes count
reviewSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Compound indexes for common queries

// 1. For course reviews page (approved main reviews, pinned first, then newest)
reviewSchema.index({ course: 1, parentReview: null, isApproved: 1, isPinned: -1, createdAt: -1 });

// 2. For admin moderation (pending approval)
reviewSchema.index({ isApproved: 1, createdAt: 1 });

// 3. For official replies listing
reviewSchema.index({ course: 1, isOfficial: 1, createdAt: -1 });

// 4. For popular reviews (most liked)
reviewSchema.index({ likes: 1, createdAt: -1 });

// 5. Composite index for user's reviews
reviewSchema.index({ user: 1, course: 1, parentReview: null });

module.exports = mongoose.model('Review', reviewSchema);
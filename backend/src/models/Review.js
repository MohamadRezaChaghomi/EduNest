const mongoose = require('mongoose');

/**
 * Review & rating for a course (supports replies, likes, pinning, official replies)
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: function () {
        return !this.parentReview;
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
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isApproved: {
      type: Boolean,
      default: false,
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ parentReview: 1 });
reviewSchema.index({ isPinned: -1, createdAt: -1 });

// Virtual for replies
reviewSchema.virtual('replies', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'parentReview',
  options: { sort: { createdAt: 1 } },
});

module.exports = mongoose.model('Review', reviewSchema);
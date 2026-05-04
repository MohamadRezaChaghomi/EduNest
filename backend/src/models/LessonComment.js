// backend/src/models/LessonComment.js

const mongoose = require('mongoose');

/**
 * Comment on a specific lesson (supports replies and likes)
 */
const lessonCommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson is required'],
      index: true,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LessonComment',
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

// Index for efficient retrieval of approved comments for a lesson (sorted by newest)
lessonCommentSchema.index({ lesson: 1, isApproved: 1, createdAt: -1 });

// Index for finding replies of a specific comment (sorted oldest first)
lessonCommentSchema.index({ parentComment: 1, createdAt: 1 });

// Index for counting likes (if needed)
lessonCommentSchema.index({ likes: 1 });

// Virtual for replies (already defined but ensure sorting)
lessonCommentSchema.virtual('replies', {
  ref: 'LessonComment',
  localField: '_id',
  foreignField: 'parentComment',
  options: { sort: { createdAt: 1 } },
});

// Virtual for like count (convenience)
lessonCommentSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

module.exports = mongoose.model('LessonComment', lessonCommentSchema);
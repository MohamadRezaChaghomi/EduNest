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
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson is required'],
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
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isApproved: {
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

lessonCommentSchema.index({ lesson: 1, createdAt: -1 });
lessonCommentSchema.index({ parentComment: 1 });

lessonCommentSchema.virtual('replies', {
  ref: 'LessonComment',
  localField: '_id',
  foreignField: 'parentComment',
  options: { sort: { createdAt: 1 } },
});

module.exports = mongoose.model('LessonComment', lessonCommentSchema);
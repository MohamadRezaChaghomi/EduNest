const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  rating: { type: Number, min: 1, max: 5, required: function() { return !this.parentReview; } },
  comment: { type: String, required: true, trim: true },
  parentReview: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: false },
  // قابلیت‌های جدید:
  isOfficial: { type: Boolean, default: false },    // پاسخ رسمی مدرس
  isPinned: { type: Boolean, default: false },      // پین شده (فقط برای نظرات اصلی)
  editedAt: { type: Date, default: null },          // زمان آخرین ویرایش
}, { timestamps: true });

reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ parentReview: 1 });
reviewSchema.index({ isPinned: -1, createdAt: -1 });

reviewSchema.virtual('replies', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'parentReview',
  options: { sort: { createdAt: 1 } },
});

module.exports = mongoose.model('Review', reviewSchema);
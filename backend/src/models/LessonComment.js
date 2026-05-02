const mongoose = require('mongoose');

const lessonCommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  comment: { type: String, required: true, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: false },   // تأیید توسط ادمین (اختیاری)
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonComment', default: null },
  editedAt: { type: Date, default: null },
}, { timestamps: true });

// ایندکس برای جستجوی سریع
lessonCommentSchema.index({ lesson: 1, createdAt: -1 });
lessonCommentSchema.index({ parentComment: 1 });

// Virtual برای گرفتن پاسخ‌ها
lessonCommentSchema.virtual('replies', {
  ref: 'LessonComment',
  localField: '_id',
  foreignField: 'parentComment',
  options: { sort: { createdAt: 1 } },
});

module.exports = mongoose.model('LessonComment', lessonCommentSchema);
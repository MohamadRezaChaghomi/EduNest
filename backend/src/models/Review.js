import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function() { return !this.parentReview; }, // فقط نظرات اصلی نیاز به امتیاز دارند (ریپلای‌ها امتیاز ندارند)
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  parentReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null, // اگر null باشد، نظر اصلی است. در غیر این صورت ریپلای به آن نظر
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isApproved: {
    type: Boolean,
    default: false, // تایید ادمین (اختیاری)
  },
}, { timestamps: true });

// اندیس‌گذاری برای عملکرد بهتر
reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ parentReview: 1 });

// virtual برای دریافت ریپلای‌ها
reviewSchema.virtual('replies', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'parentReview',
  options: { sort: { createdAt: 1 } },
});

export default mongoose.model('Review', reviewSchema);
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // کاربر گزارش‌دهنده
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true }, // نظر گزارش شده
  reason: { type: String, required: true }, // دلیل گزارش (اسپم، توهین، بی‌ربط و...)
  status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' }, // وضعیت رسیدگی
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ادمینی که بررسی کرد
  resolvedAt: Date,
  adminNote: String, // یادداشت ادمین (اختیاری)
}, { timestamps: true });

// جلوگیری از گزارش چندباره یک نظر توسط یک کاربر
reportSchema.index({ reporter: 1, review: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
const mongoose = require('mongoose');

/**
 * Report for inappropriate review
 */
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: [true, 'Review is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'rejected'],
      default: 'pending',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate report from same user on same review
reportSchema.index({ reporter: 1, review: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
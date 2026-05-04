// backend/src/models/Report.js

const mongoose = require('mongoose');

/**
 * Report Schema for inappropriate reviews
 * Users can report reviews; admins resolve them
 */
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
      index: true,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: [true, 'Review is required'],
      index: true,
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
      index: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate report from same user on same review
reportSchema.index({ reporter: 1, review: 1 }, { unique: true });

// Compound indexes for admin panel filtering
reportSchema.index({ status: 1, createdAt: -1 }); // pending reports sorted by newest
reportSchema.index({ resolvedBy: 1, resolvedAt: -1 }); // reports resolved by an admin

module.exports = mongoose.model('Report', reportSchema);
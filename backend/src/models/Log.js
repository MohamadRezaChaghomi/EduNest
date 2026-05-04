// backend/src/models/Log.js

const mongoose = require('mongoose');

/**
 * Audit log schema for tracking user and admin actions
 * Stores login attempts, role changes, bans, content moderation, etc.
 */
const logSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // can be string or object
      default: '',
    },
    ip: {
      type: String,
      default: '',
      trim: true,
    },
    userAgent: {
      type: String,
      default: '',
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common admin queries
logSchema.index({ action: 1, createdAt: -1 });
logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ performedBy: 1, createdAt: -1 });
logSchema.index({ status: 1, createdAt: -1 });
logSchema.index({ createdAt: -1 }); // for general recent logs

// TTL index to auto-delete logs older than 90 days (optional)
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Log', logSchema);
// backend/src/models/LoginAttempt.js

const mongoose = require('mongoose');

/**
 * LoginAttempt Schema for brute force protection
 * Tracks failed login attempts per identifier (email/phone)
 */
const loginAttemptSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: [true, 'Identifier (email/phone) is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 1,
      min: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
      index: true,
    },
    // Optional: store IP for additional security
    ip: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup of locked accounts
loginAttemptSchema.index({ identifier: 1, lockedUntil: 1 });

// TTL index to clean up old records (after 24 hours of inactivity)
loginAttemptSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
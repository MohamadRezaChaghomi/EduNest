// backend/src/models/OTP.js

const mongoose = require('mongoose');

/**
 * OTP Schema for phone verification
 * Used for login without password
 */
const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'OTP code is required'],
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 5 * 60 * 1000, // 5 minutes
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup of valid OTPs
otpSchema.index({ phone: 1, code: 1, verified: 1 });

// TTL index to auto-delete expired OTPs (MongoDB will remove them after expiresAt)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
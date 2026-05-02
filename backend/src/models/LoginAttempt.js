const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    identifier: {
      type: String, // email or phone
      required: true,
      lowercase: true,
      trim: true,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
loginAttemptSchema.index({ identifier: 1 });
loginAttemptSchema.index({ lockedUntil: 1 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
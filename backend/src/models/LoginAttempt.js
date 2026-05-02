const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
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

loginAttemptSchema.index({ identifier: 1 });
loginAttemptSchema.index({ lockedUntil: 1 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
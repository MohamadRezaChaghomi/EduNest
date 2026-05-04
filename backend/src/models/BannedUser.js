// backend/src/models/BannedUser.js

const mongoose = require('mongoose');

/**
 * BannedUser Schema
 * Tracks banned users with optional expiry
 */
const bannedUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true, // for automatic cleanup queries
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: check if ban is expired
bannedUserSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Index for expired bans cleanup (optional, for cron jobs)
bannedUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BannedUser', bannedUserSchema);
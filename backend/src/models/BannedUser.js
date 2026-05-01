const mongoose = require('mongoose');

/**
 * BannedUser Schema - Stores information about banned users separately from User model.
 * This allows for temporary bans, ban history, and cleaner user schema.
 */
const bannedUserSchema = new mongoose.Schema(
  {
    // Reference to the banned user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true, // Each user can be banned only once (active ban)
    },
    // Reason for the ban (provided by admin)
    reason: {
      type: String,
      required: [true, 'Ban reason is required'],
      maxlength: [200, 'Reason cannot exceed 200 characters'],
    },
    // Admin who performed the ban
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
    // Optional expiration date for temporary ban
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient queries
bannedUserSchema.index({ user: 1 });
bannedUserSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('BannedUser', bannedUserSchema);
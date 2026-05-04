// backend/src/models/RefreshToken.js

const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * RefreshToken Schema for JWT refresh tokens
 * Supports token revocation and automatic expiry
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup of valid (non-revoked, not expired) tokens
refreshTokenSchema.index({ user: 1, revoked: 1, expiresAt: 1 });

// TTL index to auto-delete expired tokens (MongoDB will remove them after expiresAt)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Static method to create a new refresh token for a user
 * @param {string} userId - User ID
 * @param {boolean} rememberMe - Extend expiry (30 days vs 7 days)
 * @returns {Promise<Object>} - Created token document
 */
refreshTokenSchema.statics.createToken = async function (userId, rememberMe = false) {
  const expiryDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  const token = crypto.randomBytes(64).toString('hex');

  const refreshToken = await this.create({
    token,
    user: userId,
    expiresAt,
    revoked: false,
  });

  return refreshToken;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);ر
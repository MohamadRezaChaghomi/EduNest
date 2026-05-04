// backend/src/models/RefreshToken.js

const mongoose = require('mongoose');
const crypto = require('crypto');

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

refreshTokenSchema.index({ user: 1, revoked: 1, expiresAt: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

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

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
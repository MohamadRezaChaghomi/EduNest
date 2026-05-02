const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Static method to create a new refresh token
refreshTokenSchema.statics.createToken = async function (userId, rememberMe = false) {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresInDays = rememberMe ? 30 : 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const refreshToken = await this.create({
    token,
    user: userId,
    expiresAt,
    revoked: false,
  });
  return refreshToken;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
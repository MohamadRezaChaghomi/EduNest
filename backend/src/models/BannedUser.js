const mongoose = require('mongoose');

const bannedUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 200,
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

bannedUserSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('BannedUser', bannedUserSchema);
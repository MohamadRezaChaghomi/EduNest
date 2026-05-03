const mongoose = require('mongoose');

const bannedUserSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    reason: { type: String, default: '' },
    expiresAt: { type: Date, default: null },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BannedUser', bannedUserSchema);
const mongoose = require('mongoose');

/**
 * Audit log for user actions (login, course creation, admin actions)
 */
const logSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      index: true,
    },
    details: {
      type: String,
      default: '',
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

logSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'REGISTER',
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'LOGOUT',
        'LOGOUT_ALL',
        'CHANGE_PASSWORD',
        'FORGOT_PASSWORD_REQUEST',
        'RESET_PASSWORD',
        'UPDATE_PROFILE',
        'ROLE_CHANGE',
        'USER_BANNED',
        'USER_UNBANNED',
        'USER_DELETED',
        'REFRESH_TOKEN',
        'REQUEST_OTP',
        'OTP_VERIFY_SUCCESS',
      ],
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ action: 1 });
logSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
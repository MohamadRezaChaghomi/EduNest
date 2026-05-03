const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    ip: { type: String },
    success: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: '1h' }, // auto-delete after 1 hour
  }
);

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
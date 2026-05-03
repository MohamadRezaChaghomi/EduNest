const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, default: () => Date.now() + 5*60*1000 }, // 5 min
  },
  { timestamps: true }
);

module.exports = mongoose.model('OTP', otpSchema);
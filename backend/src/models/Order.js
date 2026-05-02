const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    price: Number,
    discountApplied: Number,
  }],
  totalAmount: Number,
  discountTotal: Number,
  finalAmount: Number,
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: String,
  paymentId: String,
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
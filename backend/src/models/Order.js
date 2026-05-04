// backend/src/models/Order.js

const mongoose = require('mongoose');

/**
 * Order Schema for course purchases
 * Tracks user orders, payments, and enrollment status
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    items: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
          index: true,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common queries
orderSchema.index({ user: 1, createdAt: -1 }); // user's order history
orderSchema.index({ status: 1, createdAt: 1 }); // pending/failed orders for cleanup
orderSchema.index({ 'items.course': 1, status: 1 }); // check if user purchased a course

// Virtual to check if order is paid
orderSchema.virtual('isPaid').get(function () {
  return this.status === 'paid' && this.paidAt !== null;
});

module.exports = mongoose.model('Order', orderSchema);
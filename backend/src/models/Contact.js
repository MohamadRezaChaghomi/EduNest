// backend/src/models/Contact.js

const mongoose = require('mongoose');

/**
 * Contact form submissions schema
 * Stores user inquiries and support messages
 */
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    replied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient admin filtering (unread + oldest first)
contactSchema.index({ isRead: 1, createdAt: 1 });

// Virtual for formatted date
contactSchema.virtual('formattedDate').get(function () {
  return this.createdAt ? this.createdAt.toLocaleDateString('en-US') : null;
});

module.exports = mongoose.model('Contact', contactSchema);
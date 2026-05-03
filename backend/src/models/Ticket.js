const mongoose = require('mongoose');

/**
 * Support ticket for enrolled courses
 */
const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        isStaffReply: {
          type: Boolean,
          default: false,
        },
        readByUser: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ user: 1, course: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
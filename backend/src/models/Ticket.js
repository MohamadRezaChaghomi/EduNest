// backend/src/models/Ticket.js

const mongoose = require('mongoose');

/**
 * Support Ticket Schema for enrolled courses
 * Allows students to ask questions, instructors/admins to reply
 */
const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'closed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
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
          trim: true,
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

// 1. Tickets of a specific user, sorted by latest
ticketSchema.index({ user: 1, createdAt: -1 });

// 2. Tickets of a specific course (for instructors)
ticketSchema.index({ course: 1, createdAt: -1 });

// 3. Tickets filtered by status and priority (admin dashboard)
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });

// 4. Open tickets (for quick access)
ticketSchema.index({ status: 1, createdAt: 1 });

// Virtual: Last message in the ticket
ticketSchema.virtual('lastMessage').get(function () {
  if (!this.messages || this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Virtual: Count of unread messages by the user (non-staff replies)
ticketSchema.virtual('unreadUserMessages').get(function () {
  if (!this.messages) return 0;
  return this.messages.filter(msg => !msg.readByUser && !msg.isStaffReply).length;
});

// Virtual: Check if ticket is closed
ticketSchema.virtual('isClosed').get(function () {
  return this.status === 'closed';
});

module.exports = mongoose.model('Ticket', ticketSchema);
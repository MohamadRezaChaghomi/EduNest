const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isStaffReply: { type: Boolean, default: false }, // اگر پاسخ توسط ادمین/مدرس باشد
    readByUser: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  closedAt: Date,
}, { timestamps: true });

ticketSchema.index({ user: 1, course: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
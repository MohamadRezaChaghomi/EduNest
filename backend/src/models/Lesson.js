const mongoose = require('mongoose');

/**
 * Lesson (video/content) inside a section
 */
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    videoDuration: {
      type: Number,
      default: 0, // seconds
    },
    isFree: {
      type: Boolean,
      default: false, // preview for non-enrolled users
    },
    order: {
      type: Number,
      default: 0,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section reference is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
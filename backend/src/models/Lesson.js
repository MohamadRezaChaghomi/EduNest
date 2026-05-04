// backend/src/models/Lesson.js

const mongoose = require('mongoose');

/**
 * Lesson Schema – video/content inside a section
 */
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    videoDuration: {
      type: Number,
      default: 0, // seconds
      min: [0, 'Video duration cannot be negative'],
    },
    isFree: {
      type: Boolean,
      default: false, // preview for non-enrolled users
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient ordering within a section
lessonSchema.index({ section: 1, order: 1 });

// Compound index for finding free lessons across sections (if needed)
lessonSchema.index({ section: 1, isFree: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
// backend/src/models/Section.js

const mongoose = require('mongoose');

/**
 * Section Schema (chapter) of a course
 * Each section contains multiple lessons
 */
const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for lessons inside this section (sorted by order)
sectionSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'section',
  options: { sort: { order: 1 } },
});

// Compound index for efficient retrieval of sections of a course, sorted by order
sectionSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Section', sectionSchema);
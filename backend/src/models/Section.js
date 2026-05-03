const mongoose = require('mongoose');

/**
 * Section (chapter) of a course
 */
const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for lessons inside this section
sectionSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'section',
  options: { sort: { order: 1 } },
});

module.exports = mongoose.model('Section', sectionSchema);
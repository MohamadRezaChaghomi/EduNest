// backend/src/models/Course.js

const mongoose = require('mongoose');

/**
 * Course Schema – core product of the marketplace
 */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    coverImage: {
      type: String,
      default: 'default-course.jpg',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
      index: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'teaching', 'prerelease', 'completed'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for sections
courseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'course',
  options: { sort: { order: 1 } },
});

// Auto-generate slug from title (supports Persian and special chars)
courseSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .replace(/[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '') // keep Persian, English, numbers, spaces
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/-+/g, '-');
  }
  next();
});

// Sync enrolledCount with students array length
courseSchema.pre('save', function (next) {
  if (this.isModified('students')) {
    this.enrolledCount = this.students.length;
  }
  next();
});

// Compound indexes for common queries
courseSchema.index({ isPublished: 1, isApproved: 1, createdAt: -1 });
courseSchema.index({ category: 1, isPublished: 1, isApproved: 1 });
courseSchema.index({ level: 1, isPublished: 1, isApproved: 1 });
courseSchema.index({ instructor: 1, createdAt: -1 });
courseSchema.index({ ratingAverage: -1, enrolledCount: -1 }); // for popular courses

module.exports = mongoose.model('Course', courseSchema);
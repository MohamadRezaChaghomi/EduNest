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
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      default: '',
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
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
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
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    enrolledCount: {
      type: Number,
      default: 0,
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
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for sections
courseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'course',
  options: { sort: { order: 1 } },
});

// Auto-generate slug from title
courseSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .replace(/[^\w\u0600-\u06FF]/g, '-')
      .toLowerCase()
      .replace(/-+/g, '-');
  }
});

// Sync enrolledCount with students array length
courseSchema.pre('save', function () {
  if (this.isModified('students')) {
    this.enrolledCount = this.students.length;
  }
});

module.exports = mongoose.model('Course', courseSchema);
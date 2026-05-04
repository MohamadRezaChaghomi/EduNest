// backend/src/models/Category.js

const mongoose = require('mongoose');

/**
 * Category Schema – supports parent/child hierarchy
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
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
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: 'default-category.jpg',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Auto-generate slug from name if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    // Generate slug: support Persian, English, numbers, replace spaces/special chars with dash
    this.slug = this.name
      .replace(/[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
  next();
});

// Compound index for efficient queries (active categories sorted by order)
categorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Category', categorySchema);
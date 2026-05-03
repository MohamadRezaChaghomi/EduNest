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
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'default-category.jpg',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Auto-generate slug from name if not provided
categorySchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .replace(/[^\u0600-\u06FF\w]/g, '-')
      .toLowerCase();
  }
});

module.exports = mongoose.model('Category', categorySchema);
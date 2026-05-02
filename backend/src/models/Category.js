import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام دسته‌بندی الزامی است'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
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
}, { timestamps: true });

categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

categorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.replace(/[^\u0600-\u06FF\w]/g, '-').toLowerCase();
  }
  next();
});

export default mongoose.model('Category', categorySchema);
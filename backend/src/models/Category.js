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
    type: String, // URL آپلود شده در Cloudinary
    default: 'default-category.jpg',
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null, // null یعنی دسته اصلی (والد)
  },
  order: {
    type: Number,
    default: 0, // ترتیب نمایش در منو
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// ایجاد slug خودکار قبل از ذخیره
categorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200Ea-zA-Z0-9]/g, '-')
                         .replace(/-+/g, '-')
                         .toLowerCase();
  }
  next();
});

// متد برای گرفتن زیرمجموعه‌ها (virtual populate)
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

export default mongoose.model('Category', categorySchema);
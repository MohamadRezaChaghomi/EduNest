import Category from '../models/Category.js';

// @desc    ایجاد دسته جدید
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, order, image } = req.body;
    const slug = name.replace(/[^\u0600-\u06FF\w]/g, '-').toLowerCase();

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parent || null,
      order: order || 0,
      image,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    دریافت همه دسته‌ها (با زیرمجموعه)
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null })
      .sort('order')
      .populate('subcategories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    دریافت یک دسته (به همراه زیرمجموعه‌ها)
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories');
    if (!category) return res.status(404).json({ message: 'دسته پیدا نشد' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ویرایش دسته
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res) => {
  try {
    const { name, description, parent, order, image, isActive } = req.body;
    const updateData = { description, parent, order, image, isActive };
    if (name) {
      updateData.name = name;
      updateData.slug = name.replace(/[^\u0600-\u06FF\w]/g, '-').toLowerCase();
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) return res.status(404).json({ message: 'دسته پیدا نشد' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف دسته
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'دسته پیدا نشد' });
    // بررسی کنید که دوره‌ای با این دسته نباشد (اختیاری)
    await category.deleteOne();
    res.json({ message: 'دسته حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
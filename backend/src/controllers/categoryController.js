import Category from '../models/Category.js';
import Course from '../models/Course.js';

// ایجاد دسته (فقط ادمین)
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, order, image } = req.body;
    const slug = name.replace(/[^\u0600-\u06FF\w]/g, '-').toLowerCase();
    const category = await Category.create({
      name, slug, description, parent: parent || null, order: order || 0, image,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دریافت همه دسته‌ها (عمومی)
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null }).sort('order').populate('subcategories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دریافت یک دسته
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories');
    if (!category) return res.status(404).json({ message: 'دسته پیدا نشد' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ویرایش دسته (فقط ادمین)
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

// حذف دسته (فقط ادمین) – در صورت وجود دوره، حذف نمی‌شود
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'دسته پیدا نشد' });
    const coursesCount = await Course.countDocuments({ category: category._id });
    if (coursesCount > 0) {
      return res.status(400).json({ message: 'دسته دارای دوره است، ابتدا دوره‌ها را حذف یا منتقل کنید' });
    }
    await category.deleteOne();
    res.json({ message: 'دسته حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
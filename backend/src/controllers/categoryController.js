// backend/src/controllers/categoryController.js

import Category from '../models/Category.js';
import Course from '../models/Course.js';

/**
 * Create a new category (Admin only)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, order, image } = req.body;

    // Generate slug from name (supports Persian)
    const slug = name.replace(/[^\u0600-\u06FF\w]/g, '-').toLowerCase();

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parent || null,
      order: order || 0,
      image,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully.',
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get all top-level categories with subcategories populated
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null })
      .sort('order')
      .populate('subcategories');

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get a single category by ID with subcategories
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Update a category (Admin only)
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, description, parent, order, image, isActive } = req.body;
    const updateData = { description, parent, order, image, isActive };

    if (name) {
      updateData.name = name;
      updateData.slug = name.replace(/[^\u0600-\u06FF\w]/g, '-').toLowerCase();
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully.',
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a category (Admin only)
 * Prevents deletion if category has associated courses
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const coursesCount = await Course.countDocuments({ category: category._id });
    if (coursesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category: it has associated courses. Please delete or reassign courses first.',
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
// backend/src/controllers/courseController.js

const Course = require('../models/Course');
const Category = require('../models/Category');
const slugify = require('slugify');

/**
 * Generate URL-friendly slug from title (supports Persian)
 */
const generateSlug = (title) => {
  return slugify(title, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    locale: 'fa',
  });
};

/**
 * Create a new course (Instructor or Admin)
 */
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      discountPrice,
      category,
      level,
      tags,
      status,
    } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required.',
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category.',
      });
    }

    const slug = generateSlug(title);
    const existing = await Course.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A course with this title already exists.',
      });
    }

    const course = await Course.create({
      title,
      slug,
      description,
      shortDescription,
      price: price || 0,
      discountPrice: discountPrice || 0,
      category,
      level: level || 'beginner',
      tags: tags || [],
      instructor: req.user.id,
      status: status || 'draft',
      isPublished: false, // default
      isApproved: false,  // default
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully.',
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get public courses (published & approved) with filtering & pagination
 */
exports.getCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      search,
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const filter = { isPublished: true, isApproved: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .populate('category', 'name slug')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get a single course by slug (public)
 */
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      isPublished: true,
      isApproved: true,
    })
      .populate('instructor', 'name email')
      .populate('category', 'name slug')
      .populate({
        path: 'sections',
        populate: { path: 'lessons' },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Get course by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Update a course (Owner or Admin)
 */
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Authorization check
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this course.',
      });
    }

    const {
      title,
      description,
      shortDescription,
      price,
      discountPrice,
      category,
      level,
      tags,
      isPublished,
      isApproved,
      status,
    } = req.body;

    // Handle title change -> new slug
    if (title && title !== course.title) {
      const newSlug = generateSlug(title);
      const existing = await Course.findOne({
        slug: newSlug,
        _id: { $ne: course._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A course with this title already exists.',
        });
      }
      course.slug = newSlug;
      course.title = title;
    }

    if (description !== undefined) course.description = description;
    if (shortDescription !== undefined) course.shortDescription = shortDescription;
    if (price !== undefined) course.price = price;
    if (discountPrice !== undefined) course.discountPrice = discountPrice;
    if (category) course.category = category;
    if (level) course.level = level;
    if (tags) course.tags = tags;
    if (isPublished !== undefined) course.isPublished = isPublished;
    if (isApproved !== undefined && req.user.role === 'admin') course.isApproved = isApproved;
    if (status !== undefined) course.status = status;

    await course.save();

    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully.',
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Delete a course (Owner or Admin)
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this course.',
      });
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get courses of the logged-in instructor
 */
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate('category', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get all courses for admin panel with filtering
 */
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      instructor,
      isPublished,
      isApproved,
      category,
      level,
      search,
    } = req.query;

    let filter = {};

    if (status === 'published') filter.isPublished = true;
    else if (status === 'draft') filter.isPublished = false;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .populate('category', 'name slug')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all courses admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get popular courses (by rating or enrollment)
 */
exports.getPopularCourses = async (req, res) => {
  try {
    const { limit = 6, sortBy = 'rating' } = req.query;
    let sort = sortBy === 'rating'
      ? { ratingAverage: -1, ratingCount: -1 }
      : { enrolledCount: -1, createdAt: -1 };

    const courses = await Course.find({
      isPublished: true,
      isApproved: true,
      status: { $in: ['teaching', 'completed'] },
    })
      .populate('instructor', 'name')
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Get popular courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
const Course = require('../models/Course');
const Category = require('../models/Category');
const slugify = require('slugify');

const generateSlug = (title) => {
  return slugify(title, { replacement: '-', remove: /[*+~.()'"!:@]/g, lower: true, locale: 'fa' });
};

// ایجاد دوره (فقط ادمین یا اینستراکتور - بسته به نیاز)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, shortDescription, price, discountPrice, category, level, tags, status } = req.body;
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ message: 'دسته‌بندی نامعتبر است' });

    const slug = generateSlug(title);
    const existing = await Course.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'عنوان تکراری است' });

    const course = await Course.create({
      title, slug, description, shortDescription, price, discountPrice, category, level,
      tags: tags || [], instructor: req.user.id, status: status || 'draft'
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// لیست دوره‌های عمومی (فقط منتشر شده و تایید شده)
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10, status } = req.query;
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
    res.json({ courses, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دریافت یک دوره با slug (عمومی)
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true, isApproved: true })
      .populate('instructor', 'name email')
      .populate('category', 'name slug')
      .populate({ path: 'sections', populate: { path: 'lessons' } });
    if (!course) return res.status(404).json({ message: 'دوره پیدا نشد' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ویرایش دوره (مالک یا ادمین)
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'دوره پیدا نشد' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    const { title, description, shortDescription, price, discountPrice, category, level, tags, isPublished, isApproved, status } = req.body;
    if (title && title !== course.title) {
      const newSlug = generateSlug(title);
      const existing = await Course.findOne({ slug: newSlug, _id: { $ne: course._id } });
      if (existing) return res.status(400).json({ message: 'عنوان تکراری است' });
      course.slug = newSlug;
      course.title = title;
    }
    if (description) course.description = description;
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
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف دوره (مالک یا ادمین)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'دوره پیدا نشد' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    await course.deleteOne();
    res.json({ message: 'دوره حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دوره‌های من (مدرس جاری)
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate('category', 'name')
      .sort('-createdAt');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [NEW] دریافت همه دوره‌ها برای ادمین (با فیلتر)
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, instructor, isPublished, isApproved, category, level, search } = req.query;
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
    res.json({ courses, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [NEW] دوره‌های محبوب
exports.getPopularCourses = async (req, res) => {
  try {
    const { limit = 6, sortBy = 'rating' } = req.query;
    let sort = sortBy === 'rating' ? { ratingAverage: -1, ratingCount: -1 } : { enrolledCount: -1, createdAt: -1 };
    const courses = await Course.find({ isPublished: true, isApproved: true, status: { $in: ['teaching', 'completed'] } })
      .populate('instructor', 'name')
      .sort(sort)
      .limit(parseInt(limit));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
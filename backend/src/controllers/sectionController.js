import Section from '../models/Section.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

// ایجاد بخش
export const createSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'دوره پیدا نشد' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    const section = await Section.create({ title, order: order || 0, course: course._id });
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دریافت بخش‌های یک دوره (عمومی + populate lessons)
export const getSectionsByCourse = async (req, res) => {
  try {
    const sections = await Section.find({ course: req.params.courseId })
      .sort('order')
      .populate('lessons');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ویرایش بخش
export const updateSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    const section = await Section.findById(req.params.id).populate('course');
    if (!section) return res.status(404).json({ message: 'بخش پیدا نشد' });
    const course = section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    if (title !== undefined) section.title = title;
    if (order !== undefined) section.order = order;
    await section.save();
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف بخش (به همراه درس‌هایش)
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('course');
    if (!section) return res.status(404).json({ message: 'بخش پیدا نشد' });
    const course = section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    await Lesson.deleteMany({ section: section._id });
    await section.deleteOne();
    res.json({ message: 'بخش و درس‌های آن حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
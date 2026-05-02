import Lesson from '../models/Lesson.js';
import Section from '../models/Section.js';
import Course from '../models/Course.js';

// ایجاد درس
export const createLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, videoDuration, isFree, order } = req.body;
    const section = await Section.findById(req.params.sectionId).populate('course');
    if (!section) return res.status(404).json({ message: 'بخش پیدا نشد' });
    const course = section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    const lesson = await Lesson.create({
      title, description, videoUrl, videoDuration: videoDuration || 0,
      isFree: isFree || false, order: order || 0, section: section._id,
    });
    await Course.findByIdAndUpdate(course._id, { $inc: { totalLessons: 1 } });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ویرایش درس
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate({ path: 'section', populate: { path: 'course' } });
    if (!lesson) return res.status(404).json({ message: 'درس پیدا نشد' });
    const course = lesson.section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    const { title, description, videoUrl, videoDuration, isFree, order } = req.body;
    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (videoDuration !== undefined) lesson.videoDuration = videoDuration;
    if (isFree !== undefined) lesson.isFree = isFree;
    if (order !== undefined) lesson.order = order;
    await lesson.save();
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف درس
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate({ path: 'section', populate: { path: 'course' } });
    if (!lesson) return res.status(404).json({ message: 'درس پیدا نشد' });
    const course = lesson.section.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    await lesson.deleteOne();
    await Course.findByIdAndUpdate(course._id, { $inc: { totalLessons: -1 } });
    res.json({ message: 'درس حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دریافت درس‌های یک بخش (عمومی – برای نمایش در صفحه دوره)
export const getLessonsBySection = async (req, res) => {
  try {
    const lessons = await Lesson.find({ section: req.params.sectionId }).sort('order');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان درس الزامی است'],
    trim: true,
  },
  description: String,
  videoUrl: {
    type: String,
    required: [true, 'لینک ویدیو الزامی است'],
  },
  videoDuration: {
    type: Number,
    default: 0,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);
import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان بخش الزامی است'],
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

sectionSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'section',
  options: { sort: { order: 1 } },
});

export default mongoose.model('Section', sectionSchema);
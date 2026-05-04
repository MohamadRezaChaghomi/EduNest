// backend/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Course = require('./src/models/Course');
const Section = require('./src/models/Section');
const Lesson = require('./src/models/Lesson');
const Order = require('./src/models/Order');
const Review = require('./src/models/Review');

dotenv.config();

// Connect to DB (without deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected for seeding'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const categories = [
  { name: 'برنامه‌نویسی', slug: 'programming', description: 'دوره‌های آموزش برنامه‌نویسی', order: 1, isActive: true },
  { name: 'طراحی وب', slug: 'web-design', description: 'دوره‌های طراحی سایت', order: 2, isActive: true },
  { name: 'بازاریابی دیجیتال', slug: 'digital-marketing', description: 'دوره‌های بازاریابی آنلاین', order: 3, isActive: true },
];

const users = [
  {
    name: 'مدیر کل',
    email: 'admin@edunest.com',
    phone: '09120000001',
    password: 'Admin123!',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'مدرس نمونه',
    email: 'instructor@edunest.com',
    phone: '09120000002',
    password: 'Instructor123!',
    role: 'instructor',
    isActive: true,
  },
  {
    name: 'کاربر معمولی',
    email: 'user@edunest.com',
    phone: '09120000003',
    password: 'User123!',
    role: 'user',
    isActive: true,
  },
];

// Hash passwords
const hashPasswords = async (usersArr) => {
  const salt = await bcrypt.genSalt(12);
  return Promise.all(usersArr.map(async (user) => ({
    ...user,
    password: await bcrypt.hash(user.password, salt),
  })));
};

const seedDatabase = async () => {
  try {
    // Clear existing data (optional, comment if not needed)
    await User.deleteMany({});
    await Category.deleteMany({});
    await Course.deleteMany({});
    await Section.deleteMany({});
    await Lesson.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    console.log('🗑️  Existing data cleared');

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`📁 ${createdCategories.length} categories inserted`);

    // Insert users (with hashed passwords)
    const hashedUsers = await hashPasswords(users);
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`👥 ${createdUsers.length} users inserted`);

    // Get references
    const admin = createdUsers.find(u => u.role === 'admin');
    const instructor = createdUsers.find(u => u.role === 'instructor');
    const user = createdUsers.find(u => u.role === 'user');
    const programmingCat = createdCategories.find(c => c.slug === 'programming');

    // Sample course
    const course = await Course.create({
      title: 'دوره جامع React',
      slug: 'react-comprehensive',
      description: 'آموزش کامل React از پایه تا پیشرفته',
      shortDescription: 'بیاموزید React را مانند یک حرفه‌ای',
      price: 299000,
      discountPrice: 199000,
      category: programmingCat._id,
      level: 'intermediate',
      instructor: instructor._id,
      isPublished: true,
      isApproved: true,
      status: 'teaching',
      tags: ['react', 'frontend', 'javascript'],
    });
    console.log(`📚 Course created: ${course.title}`);

    // Sample section
    const section = await Section.create({
      title: 'مقدمه و نصب',
      order: 1,
      course: course._id,
    });
    console.log(`📑 Section created: ${section.title}`);

    // Sample lesson
    const lesson = await Lesson.create({
      title: 'نصب Node.js و ایجاد پروژه',
      description: 'آموزش نصب ابزارهای مورد نیاز',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      videoDuration: 120,
      isFree: true,
      order: 1,
      section: section._id,
    });
    console.log(`🎥 Lesson created: ${lesson.title}`);

    // Enroll the regular user in the course (create order and add to course.students)
    const order = await Order.create({
      user: user._id,
      items: [{ course: course._id, priceAtPurchase: course.discountPrice || course.price }],
      totalAmount: course.discountPrice || course.price,
      status: 'paid',
      paidAt: new Date(),
    });
    course.students.push(user._id);
    course.enrolledCount = course.students.length;
    await course.save();
    console.log(`✅ User enrolled in course`);

    // Sample review
    const review = await Review.create({
      user: user._id,
      course: course._id,
      rating: 5,
      comment: 'دوره عالی بود، بسیار کاربردی',
      isApproved: true,
    });
    console.log(`⭐ Review added`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

// استفاده از مسیرهای مطلق بر اساس __dirname
const modelsPath = path.join(__dirname, 'src/models');

const User = require(path.join(modelsPath, 'User'));
const Category = require(path.join(modelsPath, 'Category'));
const Course = require(path.join(modelsPath, 'Course'));
const Section = require(path.join(modelsPath, 'Section'));
const Lesson = require(path.join(modelsPath, 'Lesson'));
const Review = require(path.join(modelsPath, 'Review'));
const Ticket = require(path.join(modelsPath, 'Ticket'));
const Contact = require(path.join(modelsPath, 'Contact'));
const Log = require(path.join(modelsPath, 'Log'));

// بررسی صحت مدل‌ها
const models = { User, Category, Course, Section, Lesson, Review, Ticket, Contact, Log };
for (const [name, model] of Object.entries(models)) {
  if (typeof model?.deleteMany !== 'function') {
    console.error(`❌ مدل ${name} معتبر نیست. مطمئن شوید فایل مدل با module.exports صادر شده باشد.`);
    process.exit(1);
  }
}

// اتصال به دیتابیس
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const hashPassword = async (password) => bcrypt.hash(password, 10);

const seedDatabase = async () => {
  await connectDB();

  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Category.deleteMany({});
  await Course.deleteMany({});
  await Section.deleteMany({});
  await Lesson.deleteMany({});
  await Review.deleteMany({});
  await Ticket.deleteMany({});
  await Contact.deleteMany({});
  await Log.deleteMany({});

  // ========== ایجاد کاربران ==========
  console.log('👤 Creating users...');
  const admin = await User.create({
    name: 'مدیر سیستم',
    email: 'admin@edunest.com',
    phone: '09120000000',
    password: await hashPassword('admin123'),
    role: 'admin',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
  });
  const instructor1 = await User.create({
    name: 'مدرس برنامه‌نویسی',
    email: 'instructor@edunest.com',
    phone: '09120000001',
    password: await hashPassword('instructor123'),
    role: 'instructor',
    profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
  });
  const instructor2 = await User.create({
    name: 'مدرس طراحی',
    email: 'designer@edunest.com',
    phone: '09120000002',
    password: await hashPassword('instructor123'),
    role: 'instructor',
    profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
  });
  const student1 = await User.create({
    name: 'دانشجوی نمونه',
    email: 'student@edunest.com',
    phone: '09120000003',
    password: await hashPassword('student123'),
    role: 'user',
    profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
  });
  const student2 = await User.create({
    name: 'کاربر تست',
    email: 'test@edunest.com',
    phone: '09120000004',
    password: await hashPassword('test123'),
    role: 'user',
  });

  // ========== دسته‌بندی‌ها ==========
  console.log('📁 Creating categories...');
  const catProgramming = await Category.create({
    name: 'برنامه‌نویسی',
    slug: 'programming',
    description: 'دوره‌های تخصصی برنامه‌نویسی وب، موبایل و دسکتاپ',
    image: 'https://picsum.photos/id/0/200/200',
    order: 1,
    isActive: true,
  });
  const catDesign = await Category.create({
    name: 'طراحی',
    slug: 'design',
    description: 'طراحی UI/UX، گرافیک و انیمیشن',
    image: 'https://picsum.photos/id/1/200/200',
    order: 2,
    isActive: true,
  });
  const catMarketing = await Category.create({
    name: 'بازاریابی',
    slug: 'marketing',
    description: 'بازاریابی دیجیتال، سئو، شبکه‌های اجتماعی',
    image: 'https://picsum.photos/id/2/200/200',
    order: 3,
    isActive: true,
  });

  // ========== دوره‌ها ==========
  console.log('📚 Creating courses...');
  const course1 = await Course.create({
    title: 'React.js از صفر تا صد',
    slug: 'react-complete-guide',
    description: 'آموزش کامل React.js با پروژه‌های عملی، شامل hooks, context, redux, next.js',
    shortDescription: 'مدرن‌ترین دوره React با رویکرد پروژه‌محور',
    coverImage: 'https://picsum.photos/id/100/800/450',
    price: 450000,
    discountPrice: 350000,
    category: catProgramming._id,
    level: 'intermediate',
    isPublished: true,
    isApproved: true,
    instructor: instructor1._id,
    students: [student1._id],
    enrolledCount: 1,
    tags: ['react', 'frontend', 'javascript'],
    status: 'completed',
  });
  const course2 = await Course.create({
    title: 'UI/UX Design Masterclass',
    slug: 'ui-ux-masterclass',
    description: 'طراحی رابط کاربری و تجربه کاربری حرفه‌ای با Figma و Adobe XD',
    shortDescription: 'از ایده تا پیاده‌سازی',
    coverImage: 'https://picsum.photos/id/101/800/450',
    price: 380000,
    discountPrice: 280000,
    category: catDesign._id,
    level: 'beginner',
    isPublished: true,
    isApproved: true,
    instructor: instructor2._id,
    students: [student2._id],
    enrolledCount: 1,
    tags: ['ui', 'ux', 'figma'],
    status: 'teaching',
  });
  const course3 = await Course.create({
    title: 'SEO و سئو پیشرفته',
    slug: 'seo-advanced',
    description: 'بهینه‌سازی سایت برای موتورهای جستجو و افزایش ترافیک ارگانیک',
    shortDescription: 'تکنیک‌های عملی سئو',
    coverImage: 'https://picsum.photos/id/102/800/450',
    price: 320000,
    discountPrice: null,
    category: catMarketing._id,
    level: 'advanced',
    isPublished: false,
    isApproved: false,
    instructor: instructor1._id,
    students: [],
    enrolledCount: 0,
    tags: ['seo', 'digital-marketing'],
    status: 'draft',
  });
  const course4 = await Course.create({
    title: 'Next.js 14 پروژه‌محور',
    slug: 'nextjs-project',
    description: 'ساخت فروشگاه اینترنتی با Next.js 14 و App Router',
    shortDescription: 'پیش‌فروش – انتشار از مهر ۱۴۰۴',
    coverImage: 'https://picsum.photos/id/103/800/450',
    price: 550000,
    discountPrice: 450000,
    category: catProgramming._id,
    level: 'intermediate',
    isPublished: true,
    isApproved: true,
    instructor: instructor1._id,
    students: [],
    enrolledCount: 0,
    tags: ['nextjs', 'react', 'fullstack'],
    status: 'prerelease',
  });

  // ========== بخش‌ها و درس‌ها (ساده شده) ==========
  console.log('📖 Creating sections and lessons...');
  const sec1 = await Section.create({ title: 'مقدمات React', order: 1, course: course1._id });
  await Lesson.create({
    title: 'نصب و راه‌اندازی',
    description: 'نصب Node.js، ایجاد پروژه با Vite',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    videoDuration: 120,
    isFree: true,
    order: 1,
    section: sec1._id,
  });
  await Lesson.create({
    title: 'JSX و کامپوننت‌ها',
    description: 'آشنایی با JSX و ساخت کامپوننت‌های تابعی',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4',
    videoDuration: 180,
    isFree: false,
    order: 2,
    section: sec1._id,
  });

  // ========== نظرات ==========
  console.log('💬 Creating reviews...');
  const review1 = await Review.create({
    user: student1._id,
    course: course1._id,
    rating: 5,
    comment: 'دوره عالی بود، ممنون از تیم EduNest',
    isApproved: true,
  });
  await Review.create({
    user: student2._id,
    course: course1._id,
    rating: 4,
    comment: 'خوب بود، اما کاش مثال‌های بیشتری داشت.',
    isApproved: false,
  });
  await Review.create({
    user: student2._id,
    course: course2._id,
    rating: 5,
    comment: 'طراحی رو از صفر یاد گرفتم، فوق‌العاده بود.',
    isApproved: true,
  });
  // پاسخ رسمی به نظر اول
  await Review.create({
    user: instructor1._id,
    course: course1._id,
    comment: 'ممنون از بازخورد شما. خوشحالم که مفید بوده.',
    parentReview: review1._id,
    isApproved: true,
    isOfficial: true,
  });

  // ========== تیکت‌ها ==========
  console.log('🎫 Creating tickets...');
  await Ticket.create({
    user: student1._id,
    course: course1._id,
    subject: 'مشکل در دسترسی به ویدیو درس دوم',
    status: 'open',
    priority: 'medium',
    messages: [{
      sender: student1._id,
      message: 'سلام، ویدیو درس دوم بارگذاری نمی‌شود. لطفاً راهنمایی کنید.',
      isStaffReply: false,
    }],
  });

  // ========== پیام تماس ==========
  console.log('📧 Creating contact message...');
  await Contact.create({
    name: 'کاربر تست',
    email: 'tester@example.com',
    subject: 'پیشنهاد همکاری',
    message: 'علاقه‌مند به همکاری به عنوان مدرس هستم. لطفاً با من تماس بگیرید.',
    isRead: false,
  });

  // ========== لاگ‌ها ==========
  console.log('📜 Creating logs...');
  await Log.create({
    user: admin._id,
    action: 'USER_CREATE',
    details: 'ایجاد کاربر ادمین',
    ip: '127.0.0.1',
  });
  await Log.create({
    user: instructor1._id,
    action: 'COURSE_CREATE',
    details: 'ایجاد دوره React',
    ip: '127.0.0.1',
  });

  // به‌روزرسانی میانگین امتیاز
  const updateRating = async (courseId) => {
    const result = await Review.aggregate([
      { $match: { course: courseId, rating: { $exists: true, $ne: null }, parentReview: null, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
    ]);
    const avg = result.length ? Math.round(result[0].avg * 10) / 10 : 0;
    const cnt = result.length ? result[0].cnt : 0;
    await Course.findByIdAndUpdate(courseId, { ratingAverage: avg, ratingCount: cnt });
  };
  await updateRating(course1._id);
  await updateRating(course2._id);

  console.log('🎉 Seeding complete!');
  process.exit(0);
};

seedDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
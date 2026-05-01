require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const BannedUser = require('./src/models/BannedUser');

const users = [
  // Admin
  {
    name: 'Admin User',
    email: 'admin@edunest.com',
    phone: '09111234567',
    password: 'admin123',
    role: 'admin',
    bio: 'مدیر ارشد سایت',
    profileImage: '',
  },
  // Instructors
  {
    name: 'Mohammad Reza Mohammadi',
    email: 'mr.mohammadi@edunest.com',
    phone: '09121234567',
    password: 'instructor123',
    role: 'instructor',
    bio: 'مدرس تخصصی جاوااسکریپت و ری‌اکت',
    profileImage: '',
  },
  {
    name: 'Sara Ahmadi',
    email: 'sara.ahmadi@edunest.com',
    phone: '09131234567',
    password: 'instructor123',
    role: 'instructor',
    bio: 'مدرس پایتون و هوش مصنوعی',
    profileImage: '',
  },
  // Regular users
  {
    name: 'Ali Rezaei',
    email: 'ali.rezaei@example.com',
    phone: '09141234567',
    password: 'user123',
    role: 'user',
    bio: 'علاقه‌مند به برنامه‌نویسی',
  },
  {
    name: 'Zahra Karimi',
    email: 'zahra.karimi@example.com',
    phone: '09151234567',
    password: 'user123',
    role: 'user',
    bio: 'دانشجوی کارشناسی ارشد',
  },
  {
    name: 'Hossein Moradi',
    email: 'hossein.moradi@example.com',
    phone: '09161234567',
    password: 'user123',
    role: 'user',
    bio: 'توسعه‌دهنده فول‌استک',
  },
  {
    name: 'Fatemeh Hashemi',
    email: 'fatemeh.hashemi@example.com',
    phone: '09171234567',
    password: 'user123',
    role: 'user',
    bio: 'کارشناس دیجیتال مارکتینگ',
  },
  {
    name: 'Reza Kamali',
    email: 'reza.kamali@example.com',
    phone: '09181234567',
    password: 'user123',
    role: 'user',
    bio: 'مدیر پروژه',
  },
  {
    name: 'Maryam Noori',
    email: 'maryam.noori@example.com',
    phone: '09191234567',
    password: 'user123',
    role: 'user',
    bio: 'طراح رابط کاربری',
  },
  {
    name: 'Saeed Gholami',
    email: 'saeed.gholami@example.com',
    phone: '09201234567',
    password: 'user123',
    role: 'user',
    bio: 'برنامه‌نویس بک‌اند',
  },
  {
    name: 'Neda Abedini',
    email: 'neda.abedini@example.com',
    phone: '09211234567',
    password: 'user123',
    role: 'user',
    bio: 'متخصص سئو',
  },
  {
    name: 'Mehdi Jalali',
    email: 'mehdi.jalali@example.com',
    phone: '09221234567',
    password: 'user123',
    role: 'user',
    bio: 'داده‌کاو',
  },
  {
    name: 'Leila Safari',
    email: 'leila.safari@example.com',
    phone: '09231234567',
    password: 'user123',
    role: 'user',
    bio: 'توسعه‌دهنده موبایل',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // پاک کردن تمام کاربران و رکوردهای بن قبلی (اختیاری)
    await User.deleteMany({});
    await BannedUser.deleteMany({});
    console.log('Existing users and bans cleared');

    const createdUsers = await User.create(users);
    console.log(`✅ ${createdUsers.length} user created successfully:`);
    console.log('--- Admin ---');
    console.log(`  - ${createdUsers.find(u => u.role === 'admin').name} (${createdUsers.find(u => u.role === 'admin').email})`);
    console.log('--- Instructors ---');
    createdUsers.filter(u => u.role === 'instructor').forEach(u => console.log(`  - ${u.name} (${u.email})`));
    console.log('--- Regular Users ---');
    createdUsers.filter(u => u.role === 'user').forEach(u => console.log(`  - ${u.name} (${u.email})`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
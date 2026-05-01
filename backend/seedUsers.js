require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

const users = [
  {
    name: 'رضا محمدی',
    email: 'reza@example.com',
    password: '123456',
  },
  {
    name: 'سارا کریمی',
    email: 'sara@example.com',
    password: '123456',
  },
  {
    name: 'مهدی احمدی',
    email: 'mehdi@example.com',
    password: '123456',
  },
  {
    name: 'نرگس حسینی',
    email: 'narges@example.com',
    password: '123456',
  },
  {
    name: 'امیر رضایی',
    email: 'amir@example.com',
    password: '123456',
  },
];

const seedUsers = async () => {
  try {
    await connectDB();
    
    // حذف کاربران قبلی با این ایمیل‌ها (اختیاری - برای جلوگیری از خطا)
    for (const user of users) {
      await User.findOneAndDelete({ email: user.email });
    }
    
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} کاربر معمولی با موفقیت ایجاد شد:`);
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) نقش: ${user.role}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('خطا در ایجاد کاربران:', error.message);
    process.exit(1);
  }
};

seedUsers();
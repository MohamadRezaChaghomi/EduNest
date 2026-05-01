require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await connectDB();
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@edunest.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
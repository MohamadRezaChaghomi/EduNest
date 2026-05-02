const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const requestInfoMiddleware = require('./src/middlewares/requestInfoMiddleware');

// روت‌های احراز هویت و مدیریت
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// روت‌های محتوای اصلی
const categoryRoutes = require('./src/routes/categoryRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const sectionRoutes = require('./src/routes/sectionRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');

// روت‌های نظرات و گزارش‌ها
const reviewRoutes = require('./src/routes/reviewRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

// روت‌های آپلود فایل
const uploadRoutes = require('./src/routes/uploadRoutes');

// روت‌های تیکت پشتیبانی
const ticketRoutes = require('./src/routes/ticketRoutes');

dotenv.config();
connectDB();

const app = express();

// CORS با اعتبار (برای کوکی)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// بدنه درخواست و کوکی
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// میدلور سفارشی برای ثبت IP و User-Agent
app.use(requestInfoMiddleware);

// فایل‌های استاتیک (در صورت نیاز)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/courses/cover', express.static(path.join(__dirname, 'public/courses/cover')));

// مسیر سلامت
app.get('/api/test', (req, res) => {
  res.json({ message: 'EduNest backend is running!' });
});

// ---------- مسیرهای API ----------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', sectionRoutes);      // مسیرهای /api/courses/:courseId/sections و /api/sections/:id
app.use('/api', lessonRoutes);       // مسیرهای /api/sections/:sectionId/lessons و /api/lessons/:id

app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tickets', ticketRoutes);

// ---------- هندلر خطای 404 ----------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---------- هندلر خطای سرور ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

module.exports = app;
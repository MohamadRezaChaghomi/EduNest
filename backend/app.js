const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const requestInfoMiddleware = require('./src/middlewares/requestInfoMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const categoryRoutes = require('./src/routes/categoryRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const sectionRoutes = require('./src/routes/sectionRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestInfoMiddleware);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/courses/cover', express.static(path.join(__dirname, 'public/courses/cover')));

app.get('/api/test', (req, res) => {
  res.json({ message: 'EduNest backend is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', sectionRoutes);
app.use('/api', lessonRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

module.exports = app;
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const requestInfoMiddleware = require('./src/middlewares/requestInfoMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

dotenv.config();
connectDB();

const app = express();

// CORS - allow credentials (cookies)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom middleware to capture IP and User-Agent
app.use(requestInfoMiddleware);

// Static files (optional)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/courses/cover', express.static(path.join(__dirname, 'public/courses/cover')));

// Health check / test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'EduNest backend is running!' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

import curriculumRoutes from './src/routes/curriculumRoutes.js';
app.use('/api', curriculumRoutes); // پیشوند /api

module.exports = app;
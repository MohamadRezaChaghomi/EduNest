const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ========== Default Middlewares ==========
// Enable CORS for all origins (can be restricted later)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files (course cover images, profile images, etc.)
// Images are stored in: backend/public/courses/cover
app.use('/public', express.static(path.join(__dirname, 'public')));
// Optional: shorter URL for course covers
app.use('/courses/cover', express.static(path.join(__dirname, 'public/courses/cover')));

// ========== Routes ==========
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Test route to check if backend is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'EduNest backend is running!' });
});

// ========== Error Handling ==========
// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

module.exports = app;
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// ========== Default Middlewares ==========
// Enable CORS for all origins (you can restrict later)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files (course cover images, etc.)
// Images are stored in: backend/public/courses/cover
app.use('/public', express.static(path.join(__dirname, 'public')));

// Optional: direct route for course covers (shorter URL)
app.use('/courses/cover', express.static(path.join(__dirname, 'public/courses/cover')));

// ========== Routes ==========
app.use('/api/auth', authRoutes);

// ========== Test Route ==========
app.get('/api/test', (req, res) => {
  res.json({ message: 'EduNest backend is running!' });
});

// ========== Error handling middleware (optional for now) ==========
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
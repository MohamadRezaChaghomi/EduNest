const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // To read cookies

// Static files (optional)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/courses/cover', express.static(path.join(__dirname, 'public/courses/cover')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'EduNest backend is running!' });
});

// Error handlers
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

module.exports = app;
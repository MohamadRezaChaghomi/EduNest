// backend/app.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const requestInfo = require('./src/middleware/requestInfo');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const sectionRoutes = require('./src/routes/sectionRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const lessonCommentRoutes = require('./src/routes/lessonCommentRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const statsRoutes = require('./src/routes/statsRoutes');

dotenv.config();
connectDB();

const app = express();

// CORS with credentials
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ========== Stripe Webhook (must be before express.json) ==========
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const { stripeWebhook } = require('./src/controllers/paymentController');
  await stripeWebhook(req, res);
});

// ========== Body parsing for all other routes ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========== Custom middleware ==========
app.use(requestInfo);

// ========== Static files ==========
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/courses/cover', express.static(path.join(__dirname, 'public/courses/cover')));

// ========== Health check ==========
app.get('/api/test', (req, res) => {
  res.json({ message: 'EduNest backend is running!' });
});

// ========== API Routes ==========
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', sectionRoutes);
app.use('/api', lessonRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/lesson-comments', lessonCommentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);

// ========== 404 Handler ==========
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ========== Global Error Handler (must be last) ==========
app.use(errorHandler);

module.exports = app;
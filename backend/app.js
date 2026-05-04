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

// روت‌های جدید (پرداخت، سفارش، کامنت جلسه، ارتباط با ما)
const paymentRoutes = require('./src/routes/paymentRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const lessonCommentRoutes = require('./src/routes/lessonCommentRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

// Import stats routes
const statsRoutes = require('./src/routes/statsRoutes');


dotenv.config();
connectDB();

const app = express();

// CORS با اعتبار (برای کوکی)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// بدنه درخواست و کوکی – برای وب‌هوک استریپ باید body raw گرفته شود، پس بعداً در مسیر webhook استثنا قائل می‌شویم
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
app.use('/api', sectionRoutes);      // /api/courses/:courseId/sections و /api/sections/:id
app.use('/api', lessonRoutes);       // /api/sections/:sectionId/lessons و /api/lessons/:id

app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tickets', ticketRoutes);

// مسیرهای جدید
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/lesson-comments', lessonCommentRoutes);
app.use('/api/contact', contactRoutes);

// مسیر وب‌هوک استریپ (نیاز به body raw دارد، قبل از express.json قرار می‌گیرد؟ بهتر است اینجا تعریف شود)
// توجه: برای جلوگیری از تداخل، وب‌هوک را قبل از express.json قرار دهید یا مسیر را از body parsing عمومی استثنا کنید.
// راه ساده: یک middleware اختصاصی برای این مسیر:
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { courseId, userId } = session.metadata;
    // ثبت سفارش و اضافه کردن دانشجو (کدهای لازم را اینجا بنویسید یا از کنترلر فراخوانی کنید)
    // برای جلوگیری از پیچیدگی، فرض می‌کنیم کنترلر stripeWebhook در paymentController تعریف شده و اینجا صدا می‌شود.
    // اما به دلیل محدودیت فضا، کد کامل وب‌هوک را در کنترلر قرار دهید و اینجا فقط ارجاع دهید.
    const { stripeWebhook } = require('./src/controllers/paymentController');
    stripeWebhook(req, res);
  } else {
    res.json({ received: true });
  }
});

// ---------- هندلر خطای 404 ----------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---------- هندلر خطای سرور ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

app.use('/api/stats', statsRoutes);

module.exports = app;
const stripe = require('../config/stripe');
const Order = require('../models/Order');
const Course = require('../models/Course');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'دوره یافت نشد' });
    const finalPrice = course.discountPrice || course.price;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: course.title },
          unit_amount: finalPrice * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: { courseId: course._id.toString(), userId: req.user.id },
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Webhook برای تأیید پرداخت (در app.js یا جدا)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { courseId, userId } = session.metadata;
    // ثبت سفارش و اضافه کردن دانشجو
    const order = await Order.create({
      user: userId,
      items: [{ course: courseId, priceAtPurchase: session.amount_total / 100 }],
      totalAmount: session.amount_total / 100,
      status: 'paid',
      paidAt: new Date(),
      paymentId: session.id,
    });
    await Course.findByIdAndUpdate(courseId, { $addToSet: { students: userId }, $inc: { enrolledCount: 1 } });
  }
  res.json({ received: true });
};
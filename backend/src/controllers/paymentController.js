// backend/src/controllers/paymentController.js

const stripe = require('../config/stripe');
const Order = require('../models/Order');
const Course = require('../models/Course');

/**
 * Create a Stripe checkout session for course purchase
 * POST /api/payment/create-checkout-session
 * Access: Private
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required.',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Check if user already enrolled
    if (course.students && course.students.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }

    const finalPrice = course.discountPrice || course.price || 0;
    if (finalPrice <= 0) {
      // Free course - direct enrollment without payment
      // Optionally handle free enrollment here or redirect to free enrollment endpoint
      return res.status(400).json({
        success: false,
        message: 'Free course: Please use direct enrollment endpoint.',
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: course.title },
            unit_amount: Math.round(finalPrice * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        courseId: course._id.toString(),
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Stripe webhook handler for payment confirmation
 * POST /webhook/stripe
 * Access: Public (called by Stripe)
 * Note: This endpoint must use express.raw() middleware to get raw body for signature verification
 */
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${err.message}`,
    });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { courseId, userId } = session.metadata;

    try {
      // Check if order already exists (idempotency)
      const existingOrder = await Order.findOne({ paymentId: session.id });
      if (!existingOrder) {
        // Create order record
        const amount = session.amount_total / 100;
        const order = await Order.create({
          user: userId,
          items: [{ course: courseId, priceAtPurchase: amount }],
          totalAmount: amount,
          status: 'paid',
          paidAt: new Date(),
          paymentId: session.id,
        });

        // Enroll user in course
        await Course.findByIdAndUpdate(courseId, {
          $addToSet: { students: userId },
          $inc: { enrolledCount: 1 },
        });

        console.log(`Payment successful: User ${userId} enrolled in course ${courseId}`);
      } else {
        console.log(`Duplicate webhook event for session ${session.id}, order already exists`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Return 200 to Stripe to prevent retry, but log error
      return res.status(200).json({ received: true, error: 'Internal error logged' });
    }
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
};
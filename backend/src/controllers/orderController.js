// backend/src/controllers/orderController.js

const Order = require('../models/Order');
const Course = require('../models/Course');

/**
 * Enroll a user in a course (direct enrollment without payment gateway)
 * POST /api/orders/enroll
 * Access: Private
 */
exports.enrollCourse = async (req, res) => {
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

    // Check if user is already enrolled
    if (course.students && course.students.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }

    // Calculate final price (discount takes priority)
    const finalPrice = course.discountPrice || course.price || 0;

    // Create order record
    const order = await Order.create({
      user: req.user.id,
      items: [{ course: courseId, priceAtPurchase: finalPrice }],
      totalAmount: finalPrice,
      status: 'paid',
      paidAt: new Date(),
    });

    // Add user to course students list
    if (!course.students) course.students = [];
    course.students.push(req.user.id);
    course.enrolledCount = course.students.length;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in the course.',
      data: {
        order,
        course: { id: course._id, title: course.title },
      },
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get current user's orders
 * GET /api/orders/my
 * Access: Private
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.course', 'title slug coverImage')
      .sort('-createdAt');

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get single order by ID (owner or admin only)
 * GET /api/orders/:id
 * Access: Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.course', 'title price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order.',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};
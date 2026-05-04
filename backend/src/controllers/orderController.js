const Order = require('../models/Order');
const Course = require('../models/Course');

/**
 * @desc    Enroll a user in a course (simple direct enrollment without payment gateway)
 * @route   POST /api/orders/enroll
 * @access  Private
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user already enrolled
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Calculate final price (with discount)
    const finalPrice = course.discountPrice || course.price;

    // Create order record
    const order = await Order.create({
      user: req.user.id,
      items: [{ course: courseId, priceAtPurchase: finalPrice }],
      totalAmount: finalPrice,
      status: 'paid',
      paidAt: new Date(),
    });

    // Add user to course students
    course.students.push(req.user.id);
    course.enrolledCount = course.students.length;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in the course',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.course', 'title slug coverImage')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (only owner or admin)
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.course', 'title price');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
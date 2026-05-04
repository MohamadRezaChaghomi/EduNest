// backend/src/controllers/statsController.js

const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');

/**
 * Get site-wide statistics (total courses, students, instructors, earnings)
 * GET /api/stats/site
 * Access: Public
 */
exports.getSiteStats = async (req, res) => {
  try {
    const [totalCourses, totalStudents, totalInstructors, salesData] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'instructor' }),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalEarnings = salesData.length > 0 ? salesData[0].total : 0;

    res.json({
      success: true,
      data: {
        courses: totalCourses,
        students: totalStudents,
        instructors: totalInstructors,
        earnings: totalEarnings,
      },
    });
  } catch (error) {
    console.error('Get site stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics. Please try again later.',
    });
  }
};
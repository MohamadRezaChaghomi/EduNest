const Log = require('../models/Log');

/**
 * Create an audit log entry
 * @param {Object} data
 * @param {string} data.action - one of the enum values
 * @param {string} data.status - SUCCESS, FAILED, PENDING
 * @param {mongoose.Types.ObjectId} data.user - user ID (optional)
 * @param {string} data.ip - IP address
 * @param {string} data.userAgent - browser user agent
 * @param {Object} data.details - any extra info
 * @param {mongoose.Types.ObjectId} data.performedBy - admin who performed action (optional)
 */
const createLog = async (data) => {
  try {
    await Log.create({
      user: data.user || null,
      action: data.action,
      status: data.status || 'SUCCESS',
      ip: data.ip || null,
      userAgent: data.userAgent || null,
      details: data.details || null,
      performedBy: data.performedBy || null,
    });
  } catch (error) {
    console.error('Error creating audit log:', error.message);
  }
};

module.exports = { createLog };
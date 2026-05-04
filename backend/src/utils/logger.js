// backend/src/utils/logger.js

const Log = require('../models/Log');

/**
 * Create an audit log entry
 * @param {Object} data
 * @param {string} data.action - Action name (e.g., 'LOGIN_SUCCESS', 'USER_BANNED')
 * @param {string} [data.status] - SUCCESS, FAILED, PENDING (default SUCCESS)
 * @param {string|ObjectId} [data.user] - User ID (optional)
 * @param {string} [data.ip] - Client IP address
 * @param {string} [data.userAgent] - Browser user agent
 * @param {any} [data.details] - Extra info (string or object)
 * @param {string|ObjectId} [data.performedBy] - Admin who performed action (optional)
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
    // Never throw from logger to avoid breaking main flow
    console.error('❌ Error creating audit log:', error.message);
  }
};

module.exports = { createLog };
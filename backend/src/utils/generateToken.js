// backend/src/utils/generateToken.js

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {string} id - User ID
 * @param {string} role - User role (user, instructor, admin)
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' } // Match controller default
  );
};

module.exports = generateToken;
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {string} id - User ID
 * @param {string} role - User role (user, instructor, admin)
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = generateToken;
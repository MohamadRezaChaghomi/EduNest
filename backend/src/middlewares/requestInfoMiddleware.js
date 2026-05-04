// backend/src/middleware/requestInfo.js

/**
 * Middleware to extract client IP and user agent
 * Attaches clientIp and userAgent to req object
 */
const requestInfo = (req, res, next) => {
  // Get client IP (handles proxy headers)
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
  if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
  req.clientIp = ip;

  // Get user agent
  req.userAgent = req.headers['user-agent'] || 'unknown';

  next();
};

module.exports = requestInfo;
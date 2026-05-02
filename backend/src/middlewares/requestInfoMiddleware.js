const requestInfoMiddleware = (req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  req.userAgent = req.headers['user-agent'] || 'unknown';
  next();
};

module.exports = requestInfoMiddleware;
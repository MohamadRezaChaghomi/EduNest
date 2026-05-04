const requestInfo = (req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
  if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
  req.clientIp = ip;
  req.userAgent = req.headers['user-agent'] || 'unknown';
  next();
};
module.exports = requestInfo;
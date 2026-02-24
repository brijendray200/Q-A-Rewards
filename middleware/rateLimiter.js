const rateLimit = {};

const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();

    if (!rateLimit[userId]) {
      rateLimit[userId] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    if (now > rateLimit[userId].resetTime) {
      rateLimit[userId] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    if (rateLimit[userId].count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimit[userId].resetTime - now) / 1000)
      });
    }

    rateLimit[userId].count++;
    next();
  };
};

module.exports = rateLimiter;

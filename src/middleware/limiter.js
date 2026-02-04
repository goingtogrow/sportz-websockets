import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // max 100 requests per window
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later',
  },
});

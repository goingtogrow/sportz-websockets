import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later',
  },
});

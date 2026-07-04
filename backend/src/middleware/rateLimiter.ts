import rateLimit from "express-rate-limit";

// NFR-S03: Auth endpoints limited to 5 requests/minute per IP
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

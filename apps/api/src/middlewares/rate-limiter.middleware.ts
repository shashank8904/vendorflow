import rateLimit from "express-rate-limit";
import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_MUTATION_MAX,
} from "../constants";
import { ApiResponseBuilder } from "../utils/api-response";

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponseBuilder.error(
      res,
      "Too many requests, please try again later",
      429
    );
  },
});

/**
 * Stricter rate limiter for mutation endpoints (POST/PATCH/DELETE).
 * 20 requests per 15 minutes per IP.
 */
export const mutationRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MUTATION_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponseBuilder.error(
      res,
      "Too many mutation requests, please try again later",
      429
    );
  },
});

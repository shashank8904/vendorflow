import pinoHttp from "pino-http";
import logger from "../lib/logger";

/**
 * HTTP request/response logging middleware using pino-http.
 * Logs method, url, status, and response time for every request.
 */
export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      // Skip health check logs to reduce noise
      return req.url === "/api/v1/health";
    },
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
});

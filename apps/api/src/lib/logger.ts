import pino from "pino";
import { env } from "../config/env";

/**
 * Structured logger using Pino.
 * - Development: pretty-printed, colorized output
 * - Production: JSON lines for log aggregation
 */
const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  ...(env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;

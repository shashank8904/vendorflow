import app from "./app";
import { env } from "./config/env";
import logger from "./lib/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 VendorFlow API running on http://localhost:${env.PORT}`);
  logger.info(`📋 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 API prefix: /api/v1`);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception — shutting down");
  process.exit(1);
});
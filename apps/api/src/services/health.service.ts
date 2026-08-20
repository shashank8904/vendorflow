import prisma from "../lib/prisma";

/**
 * Health check service.
 */
class HealthService {
  /**
   * Run all health checks and return system status.
   */
  async getHealthStatus() {
    const startTime = process.uptime();
    let databaseStatus = "connected";
    let databaseLatencyMs = 0;

    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      databaseLatencyMs = Date.now() - dbStart;
    } catch {
      databaseStatus = "disconnected";
    }

    return {
      status: databaseStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: Math.round(startTime),
      database: {
        status: databaseStatus,
        latencyMs: databaseLatencyMs,
      },
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };
  }
}

export const healthService = new HealthService();

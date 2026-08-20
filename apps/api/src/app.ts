import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { API_PREFIX } from "./constants";

// ─── Middlewares ──────────────────────────────────────────────────────────────
import { requestLogger } from "./middlewares/request-logger.middleware";
import { apiRateLimiter } from "./middlewares/rate-limiter.middleware";
import { companyContext } from "./middlewares/company-context.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { globalErrorHandler } from "./middlewares/error-handler.middleware";

// ─── Routes ──────────────────────────────────────────────────────────────────
import healthRoutes from "./routes/health.routes";
import vendorRoutes from "./routes/vendor.routes";
import purchaseOrderRoutes from "./routes/purchase-order.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import analyticsRoutes from "./routes/analytics.routes";
import notificationRoutes from "./routes/notification.routes";
import auditLogRoutes from "./routes/audit-log.routes";
import callRoutes from "./routes/call.routes";
import authRoutes from "./routes/auth.routes";
import prRoutes from "./routes/pr.routes";
import rfqRoutes from "./routes/rfq.routes";
import tallyRoutes from "./routes/tally.routes";

// ─── Express App ─────────────────────────────────────────────────────────────

const app = express();

// ─── Global Middlewares ──────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? env.APP_URL : "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Company-Id"],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(`${API_PREFIX}/`, apiRateLimiter);

// ─── Public Routes (no company context required) ─────────────────────────────

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);

// ─── Company Context Middleware ──────────────────────────────────────────────
// All routes below require X-Company-Id header

app.use(`${API_PREFIX}/`, companyContext);

// ─── Protected Routes ────────────────────────────────────────────────────────

app.use(`${API_PREFIX}/vendors`, vendorRoutes);
app.use(`${API_PREFIX}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/audit-logs`, auditLogRoutes);
app.use(`${API_PREFIX}/calls`, callRoutes);
app.use(`${API_PREFIX}/prs`, prRoutes);
app.use(`${API_PREFIX}/rfqs`, rfqRoutes);
app.use(`${API_PREFIX}/tally`, tallyRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
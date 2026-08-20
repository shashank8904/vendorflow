/**
 * Shared constants used across the application.
 */

// ─── API ─────────────────────────────────────────────────────────────────────

export const API_PREFIX = "/api/v1";

// ─── Pagination Defaults ─────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const DEFAULT_SORT = "createdAt";
export const DEFAULT_ORDER = "desc" as const;

// ─── Rate Limiting ───────────────────────────────────────────────────────────

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const RATE_LIMIT_MUTATION_MAX = 20;

// ─── HTTP Status Codes ───────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ─── Audit Log Actions ───────────────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  VENDOR_CREATED: "VENDOR_CREATED",
  VENDOR_UPDATED: "VENDOR_UPDATED",
  VENDOR_DELETED: "VENDOR_DELETED",
  PO_CREATED: "PO_CREATED",
  PO_UPDATED: "PO_UPDATED",
  PO_STATUS_UPDATED: "PO_STATUS_UPDATED",
  PO_DELETED: "PO_DELETED",
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
} as const;

// ─── Entities ────────────────────────────────────────────────────────────────

export const ENTITIES = {
  VENDOR: "Vendor",
  PURCHASE_ORDER: "PurchaseOrder",
  NOTIFICATION: "Notification",
  CALL: "Call",
} as const;

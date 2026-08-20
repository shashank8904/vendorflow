/**
 * Augment Express Request with tenant context.
 * These fields are populated by the company-context middleware (and later, auth middleware).
 */
declare namespace Express {
  interface Request {
    /** Tenant identifier — set by company-context middleware */
    companyId: string;
    /** Authenticated user ID — placeholder for future auth integration */
    userId?: string;
  }
}

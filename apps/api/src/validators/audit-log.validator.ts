import { z } from "zod";

// ─── Query Audit Logs ────────────────────────────────────────────────────────

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.enum(["createdAt", "action", "entity"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  entity: z.string().optional(),
  action: z.string().optional(),
  entityId: z.string().optional(),
});

export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;

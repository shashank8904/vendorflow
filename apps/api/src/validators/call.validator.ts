import { z } from "zod";

// ─── Query Calls ─────────────────────────────────────────────────────────────

export const callQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z
    .enum(["createdAt", "startedAt", "endedAt", "status"])
    .optional()
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]).optional(),
  purchaseOrderId: z.string().optional(),
  vendorId: z.string().optional(),
});

export type CallQueryInput = z.infer<typeof callQuerySchema>;

// ─── Call ID Param ────────────────────────────────────────────────────────────

export const callIdParamSchema = z.object({
  id: z.string().min(1, "Call ID is required"),
});

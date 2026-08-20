import { z } from "zod";

// ─── Create Notification ─────────────────────────────────────────────────────

export const createNotificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(1000),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]).optional().default("INFO"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// ─── Query Notifications ─────────────────────────────────────────────────────

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.enum(["createdAt", "type", "isRead"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  isRead: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]).optional(),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;

// ─── Notification ID Param ───────────────────────────────────────────────────

export const notificationIdParamSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
});

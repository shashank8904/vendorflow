import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  hsnSac: z.string().optional(),
  uom: z.string().optional(),
  taxRatePercent: z.number().min(0).max(100).optional(),
  type: z.enum(["STOCK", "SERVICE"]).optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = createItemSchema.partial();
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const itemIdParamSchema = z.object({
  id: z.string().min(1),
});

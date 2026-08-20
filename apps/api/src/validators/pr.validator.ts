import { z } from "zod";

export const prItemSchema = z.object({
  itemId: z.string().optional(),
  freeTextDescription: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().optional(),
  estimatedRate: z.number().nonnegative().optional(),
}).refine(data => data.itemId || data.freeTextDescription, {
  message: "Either itemId or freeTextDescription must be provided",
  path: ["itemId"],
});

export const createPRSchema = z.object({
  department: z.string().optional(),
  requiredByDate: z.string().datetime(),
  budgetCode: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prItemSchema).min(1, "At least one item is required"),
});

export type CreatePRInput = z.infer<typeof createPRSchema>;

export const prIdParamSchema = z.object({
  id: z.string().min(1),
});

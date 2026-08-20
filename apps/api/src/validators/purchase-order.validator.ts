import { z } from "zod";

export const poItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  taxPercent: z.number().nonnegative(),
}).refine(data => data.itemId || data.description, {
  message: "Either itemId or description must be provided",
  path: ["itemId"],
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  description: z.string().max(500).optional(),
  requestedDeliveryDate: z.string().datetime(),
  plantAddress: z.string().optional(),
  items: z.array(poItemSchema).min(1, "At least one item is required"),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;

export const updatePurchaseOrderSchema = z.object({
  description: z.string().max(500).optional(),
  requestedDeliveryDate: z.string().datetime().optional(),
  plantAddress: z.string().optional(),
});

export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;

export const updatePOStatusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "CONFIRMED", "SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED", "DELAYED", "CANCELLED", "CLOSED"]),
});

export type UpdatePOStatusInput = z.infer<typeof updatePOStatusSchema>;

export const purchaseOrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z.enum(["poNumber", "totalValue", "status", "requestedDeliveryDate", "createdAt"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "CONFIRMED", "SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED", "DELAYED", "CANCELLED", "CLOSED"]).optional(),
  vendorId: z.string().optional(),
});

export type PurchaseOrderQueryInput = z.infer<typeof purchaseOrderQuerySchema>;

export const poIdParamSchema = z.object({
  id: z.string().min(1, "Purchase Order ID is required"),
});

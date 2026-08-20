import { z } from "zod";

export const createRFQSchema = z.object({
  prId: z.string().min(1, "Purchase Request ID is required"),
  vendorIds: z.array(z.string()).min(1, "At least one vendor ID is required"),
});

export type CreateRFQInput = z.infer<typeof createRFQSchema>;

export const rfqIdParamSchema = z.object({
  id: z.string().min(1, "RFQ ID is required"),
});

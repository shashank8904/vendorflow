import { z } from "zod";

export const createVendorSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters").max(100),
  code: z.string().optional(),
  gstNumber: z.string().optional(),
  pan: z.string().optional(),
  contactPerson: z.string().optional(),
  primaryContactName: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  phones: z.array(z.string()).optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().max(255).optional(),
  category: z.string().optional(),
  paymentTerms: z.string().optional(),
  defaultLeadTimeDays: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;

export const updateVendorSchema = createVendorSchema.partial().extend({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;

export const vendorQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z
    .enum(["name", "contactPerson", "email", "phone", "status", "createdAt"])
    .optional()
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type VendorQueryInput = z.infer<typeof vendorQuerySchema>;

export const vendorIdParamSchema = z.object({
  id: z.string().min(1, "Vendor ID is required"),
});
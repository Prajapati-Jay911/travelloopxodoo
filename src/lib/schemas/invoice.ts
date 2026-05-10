import { z } from "zod";

export const updateInvoiceSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled"]).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
});

export const invoiceActionSchema = z.object({
  action: z.enum(["pay", "cancel"]),
});

import { z } from "zod";
import { checklistCategorySchema, nameText } from "@/lib/schemas/common";

export const createChecklistItemSchema = z.object({
  name: nameText,
  category: checklistCategorySchema,
});

export const updateChecklistItemSchema = z.object({
  name: nameText.optional(),
  isPacked: z.boolean().optional(),
});

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;


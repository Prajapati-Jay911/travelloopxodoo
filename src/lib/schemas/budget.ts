import { z } from "zod";

export const budgetSchema = z.object({
  transport: z.coerce.number().min(0).default(0),
  stay: z.coerce.number().min(0).default(0),
  meals: z.coerce.number().min(0).default(0),
  activities: z.coerce.number().min(0).default(0),
  misc: z.coerce.number().min(0).default(0),
  totalAllocated: z.coerce.number().min(0).default(0),
});

export type BudgetInput = z.infer<typeof budgetSchema>;


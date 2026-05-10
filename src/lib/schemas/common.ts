import { ActivityType, ChecklistCategory } from "@prisma/client";
import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

export const idSchema = z.object({
  id: nonEmpty,
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
  .transform((value) => new Date(value));

export const activityTypeSchema = z.enum(ActivityType);
export const checklistCategorySchema = nonEmpty.max(50);

export function dateRangeRefinement<T extends { startDate: Date; endDate: Date }>(
  value: T,
  ctx: z.RefinementCtx,
) {
  if (value.endDate < value.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End date must be on or after start date",
    });
  }
}

export const optionalUrl = z
  .string()
  .url()
  .or(z.literal(""))
  .optional()
  .transform((value) => (value ? value : undefined));

export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const nameText = nonEmpty.min(2).max(120);


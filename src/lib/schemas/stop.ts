import { z } from "zod";
import { dateRangeRefinement, dateString } from "@/lib/schemas/common";

const stopBodySchema = z.object({
  cityId: z.string().trim().min(1),
  startDate: dateString,
  endDate: dateString,
});

export const createStopSchema = stopBodySchema.superRefine(dateRangeRefinement);

export const updateStopSchema = stopBodySchema.partial().superRefine((value, ctx) => {
  if (value.startDate && value.endDate) {
    dateRangeRefinement(value as { startDate: Date; endDate: Date }, ctx);
  }
});

export const reorderStopsSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1),
});

export type CreateStopInput = z.infer<typeof createStopSchema>;
export type UpdateStopInput = z.infer<typeof updateStopSchema>;
export type ReorderStopsInput = z.infer<typeof reorderStopsSchema>;

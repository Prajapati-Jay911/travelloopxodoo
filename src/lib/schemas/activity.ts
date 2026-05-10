import { z } from "zod";
import {
  activityTypeSchema,
  nameText,
  optionalText,
  optionalUrl,
  paginationSchema,
} from "@/lib/schemas/common";

export const activityBodySchema = z.object({
  name: nameText,
  type: activityTypeSchema,
  cost: z.coerce.number().min(0).default(0),
  duration: z.coerce.number().int().positive().max(1440),
  description: optionalText,
  imageUrl: optionalUrl,
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
});

export const updateActivitySchema = activityBodySchema.partial();

export const catalogActivityQuerySchema = paginationSchema.extend({
  cityId: z.string().trim().optional(),
  type: activityTypeSchema.optional(),
  maxCost: z.coerce.number().min(0).optional(),
  minCost: z.coerce.number().min(0).optional(),
  q: z.string().trim().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ActivityBodyInput = z.infer<typeof activityBodySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CatalogActivityQuery = z.infer<typeof catalogActivityQuerySchema>;


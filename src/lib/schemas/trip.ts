import { z } from "zod";
import {
  dateRangeRefinement,
  dateString,
  nameText,
  optionalText,
  optionalUrl,
  paginationSchema,
} from "@/lib/schemas/common";

export const tripListQuerySchema = paginationSchema.extend({
  status: z.enum(["upcoming", "past", "draft"]).optional(),
  q: z.string().trim().optional(),
  sortBy: z.enum(["newest", "oldest", "budget"]).default("newest"),
});

const tripBodySchema = z.object({
  name: nameText,
  description: optionalText,
  coverPhoto: optionalUrl,
  startDate: dateString,
  endDate: dateString,
  isPublic: z.boolean().default(false),
});

export const createTripSchema = tripBodySchema.superRefine(dateRangeRefinement);

export const updateTripSchema = tripBodySchema.partial().superRefine((value, ctx) => {
  if (value.startDate && value.endDate) {
    dateRangeRefinement(value as { startDate: Date; endDate: Date }, ctx);
  }
});

export const communityQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  city: z.string().trim().optional(),
  sortBy: z.enum(["recent", "popular"]).default("recent"),
});

export type TripListQuery = z.infer<typeof tripListQuerySchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type CommunityQuery = z.infer<typeof communityQuerySchema>;

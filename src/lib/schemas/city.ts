import { z } from "zod";
import { paginationSchema } from "@/lib/schemas/common";

export const cityQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  country: z.string().trim().optional(),
  region: z.string().trim().optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value ? value === "true" : undefined)),
});

export type CityQuery = z.infer<typeof cityQuerySchema>;


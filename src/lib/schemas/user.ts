import { z } from "zod";
import { optionalText, optionalUrl } from "@/lib/schemas/common";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(60).optional(),
  lastName: z.string().trim().min(2).max(60).optional(),
  photo: optionalUrl,
  phone: optionalText,
  city: optionalText,
  country: optionalText,
  bio: optionalText,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;


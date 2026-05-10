import { z } from "zod";

export const noteQuerySchema = z.object({
  stopId: z.string().trim().optional(),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(2).max(160),
  content: z.string().trim().min(1).max(10000),
  stopId: z.string().trim().optional(),
  day: z.number().int().min(1).optional().nullable(),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  content: z.string().trim().min(1).max(10000).optional(),
  day: z.number().int().min(1).optional().nullable(),
});

export type NoteQuery = z.infer<typeof noteQuerySchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

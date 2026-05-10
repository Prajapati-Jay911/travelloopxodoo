import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { CreateNoteInput, NoteQuery, UpdateNoteInput } from "@/lib/schemas/note";

async function assertOwnsTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) {
    throw notFound("Trip not found", "TRIP_NOT_FOUND");
  }

  if (trip.userId !== userId) {
    throw forbidden();
  }
}

async function assertStopInTrip(tripId: string, stopId?: string) {
  if (!stopId) {
    return;
  }

  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    select: { tripId: true },
  });

  if (!stop || stop.tripId !== tripId) {
    throw notFound("Stop not found", "STOP_NOT_FOUND");
  }
}

async function getNoteOwner(noteId: string) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true },
  });

  if (!note) {
    throw notFound("Note not found", "NOTE_NOT_FOUND");
  }

  return note.userId;
}

export async function listNotes(userId: string, tripId: string, query: NoteQuery) {
  await assertOwnsTrip(userId, tripId);

  return prisma.note.findMany({
    where: { tripId, ...(query.stopId ? { stopId: query.stopId } : {}) },
    orderBy: { updatedAt: "desc" },
    include: {
      stop: { include: { city: true } },
    },
  });
}

export async function createNote(userId: string, tripId: string, input: CreateNoteInput) {
  await assertOwnsTrip(userId, tripId);
  await assertStopInTrip(tripId, input.stopId);

  return prisma.note.create({
    data: { ...input, tripId, userId },
    include: { stop: { include: { city: true } } },
  });
}

export async function updateNote(userId: string, noteId: string, input: UpdateNoteInput) {
  if ((await getNoteOwner(noteId)) !== userId) {
    throw forbidden();
  }

  return prisma.note.update({
    where: { id: noteId },
    data: input,
  });
}

export async function deleteNote(userId: string, noteId: string) {
  if ((await getNoteOwner(noteId)) !== userId) {
    throw forbidden();
  }

  await prisma.note.delete({ where: { id: noteId } });
  return { deleted: true };
}

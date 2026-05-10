import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type {
  CreateStopInput,
  ReorderStopsInput,
  UpdateStopInput,
} from "@/lib/schemas/stop";

async function getTripOwner(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) {
    throw notFound("Trip not found", "TRIP_NOT_FOUND");
  }

  return trip.userId;
}

async function assertOwnsTrip(userId: string, tripId: string) {
  if ((await getTripOwner(tripId)) !== userId) {
    throw forbidden();
  }
}

async function assertStopBelongsToTrip(tripId: string, stopId: string) {
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    select: { tripId: true },
  });

  if (!stop || stop.tripId !== tripId) {
    throw notFound("Stop not found", "STOP_NOT_FOUND");
  }
}

export async function listStops(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);

  return prisma.stop.findMany({
    where: { tripId },
    orderBy: { order: "asc" },
    include: {
      city: true,
      activities: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function createStop(userId: string, tripId: string, input: CreateStopInput) {
  await assertOwnsTrip(userId, tripId);

  const cityExists = await prisma.city.findUnique({
    where: { id: input.cityId },
    select: { id: true },
  });

  if (!cityExists) {
    throw notFound("City not found", "CITY_NOT_FOUND");
  }

  const nextOrder = await prisma.stop.count({ where: { tripId } });

  return prisma.stop.create({
    data: { ...input, tripId, order: nextOrder },
    include: { city: true, activities: true },
  });
}

export async function updateStop(
  userId: string,
  tripId: string,
  stopId: string,
  input: UpdateStopInput,
) {
  await assertOwnsTrip(userId, tripId);
  await assertStopBelongsToTrip(tripId, stopId);

  if (input.cityId) {
    const cityExists = await prisma.city.findUnique({
      where: { id: input.cityId },
      select: { id: true },
    });

    if (!cityExists) {
      throw notFound("City not found", "CITY_NOT_FOUND");
    }
  }

  return prisma.stop.update({
    where: { id: stopId },
    data: input,
    include: { city: true, activities: true },
  });
}

export async function deleteStop(userId: string, tripId: string, stopId: string) {
  await assertOwnsTrip(userId, tripId);
  await assertStopBelongsToTrip(tripId, stopId);

  await prisma.$transaction(async (tx) => {
    await tx.stop.delete({ where: { id: stopId } });
    const remaining = await tx.stop.findMany({
      where: { tripId },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    for (const [order, stop] of remaining.entries()) {
      await tx.stop.update({ where: { id: stop.id }, data: { order } });
    }
  });

  return { deleted: true };
}

export async function reorderStops(
  userId: string,
  tripId: string,
  input: ReorderStopsInput,
) {
  await assertOwnsTrip(userId, tripId);

  const stops = await prisma.stop.findMany({
    where: { tripId },
    select: { id: true },
  });
  const existingIds = new Set(stops.map((stop) => stop.id));

  if (input.orderedIds.length !== stops.length || input.orderedIds.some((id) => !existingIds.has(id))) {
    throw notFound("Stop order must include every stop exactly once", "INVALID_STOP_ORDER");
  }

  await prisma.$transaction(async (tx) => {
    for (const [index, id] of input.orderedIds.entries()) {
      await tx.stop.update({ where: { id }, data: { order: -index - 1 } });
    }

    for (const [order, id] of input.orderedIds.entries()) {
      await tx.stop.update({ where: { id }, data: { order } });
    }
  });

  return listStops(userId, tripId);
}


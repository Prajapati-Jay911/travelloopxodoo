import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { BudgetInput } from "@/lib/schemas/budget";

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

async function getTotalSpent(tripId: string) {
  const stops = await prisma.stop.findMany({
    where: { tripId },
    select: { id: true },
  });
  const stopIds = stops.map((stop) => stop.id);

  if (stopIds.length === 0) {
    return 0;
  }

  const aggregate = await prisma.activity.aggregate({
    where: { stopId: { in: stopIds } },
    _sum: { cost: true },
  });

  return aggregate._sum.cost ?? 0;
}

export async function getBudget(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);

  const [budget, totalSpent] = await Promise.all([
    prisma.budget.upsert({
      where: { tripId },
      create: { tripId },
      update: {},
    }),
    getTotalSpent(tripId),
  ]);

  return { ...budget, totalSpent };
}

export async function upsertBudget(userId: string, tripId: string, input: BudgetInput) {
  await assertOwnsTrip(userId, tripId);

  const [budget, totalSpent] = await Promise.all([
    prisma.budget.upsert({
      where: { tripId },
      create: { tripId, ...input },
      update: input,
    }),
    getTotalSpent(tripId),
  ]);

  return { ...budget, totalSpent };
}


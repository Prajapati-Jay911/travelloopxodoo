import { Prisma } from "@prisma/client";
import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type {
  ActivityBodyInput,
  CatalogActivityQuery,
  UpdateActivityInput,
} from "@/lib/schemas/activity";

async function getStopOwner(stopId: string) {
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    select: { trip: { select: { userId: true } } },
  });

  if (!stop) {
    throw notFound("Stop not found", "STOP_NOT_FOUND");
  }

  return stop.trip.userId;
}

async function getActivityOwner(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { stop: { select: { trip: { select: { userId: true } } } } },
  });

  if (!activity) {
    throw notFound("Activity not found", "ACTIVITY_NOT_FOUND");
  }

  return activity.stop.trip.userId;
}

export async function addActivity(userId: string, stopId: string, input: ActivityBodyInput) {
  if ((await getStopOwner(stopId)) !== userId) {
    throw forbidden();
  }

  return prisma.activity.create({
    data: { ...input, stopId },
  });
}

export async function updateActivity(
  userId: string,
  activityId: string,
  input: UpdateActivityInput,
) {
  if ((await getActivityOwner(activityId)) !== userId) {
    throw forbidden();
  }

  return prisma.activity.update({
    where: { id: activityId },
    data: input,
  });
}

export async function deleteActivity(userId: string, activityId: string) {
  if ((await getActivityOwner(activityId)) !== userId) {
    throw forbidden();
  }

  await prisma.activity.delete({ where: { id: activityId } });
  return { deleted: true };
}

export async function listCatalogActivities(query: CatalogActivityQuery) {
  const where: Prisma.CatalogActivityWhereInput = {
    ...(query.cityId ? { cityId: query.cityId } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.minCost || query.maxCost
      ? { cost: { gte: query.minCost, lte: query.maxCost } }
      : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
            { city: { name: { contains: query.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, data] = await prisma.$transaction([
    prisma.catalogActivity.count({ where }),
    prisma.catalogActivity.findMany({
      where,
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      orderBy: [{ popularity: "desc" }, { name: "asc" }],
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true,
            flag: true,
            costIndex: true,
            imageUrl: true,
          },
        },
      },
    }),
  ]);

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

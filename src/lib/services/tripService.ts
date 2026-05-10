import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { communityUserSelect } from "@/lib/services/userSelect";
import type {
  CommunityQuery,
  CreateTripInput,
  TripListQuery,
  UpdateTripInput,
} from "@/lib/schemas/trip";

const fullTripInclude = {
  stops: {
    orderBy: { order: "asc" },
    include: {
      city: true,
      activities: { orderBy: { createdAt: "asc" } },
    },
  },
  budget: true,
  checklist: {
    orderBy: { createdAt: "asc" },
  },
  _count: {
    select: {
      notes: true,
    },
  },
} satisfies Prisma.TripInclude;

function tripStatusWhere(status?: TripListQuery["status"]): Prisma.TripWhereInput {
  const now = new Date();

  if (status === "upcoming") {
    return { startDate: { gt: now } };
  }

  if (status === "past") {
    return { endDate: { lt: now } };
  }

  if (status === "draft") {
    return { stops: { none: {} } };
  }

  return {};
}

function withTotalCost<T extends { stops: { activities: { cost: number }[] }[] }>(trip: T) {
  const totalCost = trip.stops.reduce(
    (sum, stop) =>
      sum + stop.activities.reduce((activitySum, activity) => activitySum + activity.cost, 0),
    0,
  );

  return { ...trip, totalCost };
}

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

export async function listTrips(userId: string, query: TripListQuery) {
  const where: Prisma.TripWhereInput = {
    userId,
    ...tripStatusWhere(query.status),
    ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
  };

  const orderBy: Prisma.TripOrderByWithRelationInput =
    query.sortBy === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [total, trips] = await prisma.$transaction([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        budget: true,
        stops: {
          select: {
            id: true,
            activities: { select: { cost: true } },
          },
        },
        _count: { select: { stops: true } },
      },
    }),
  ]);

  const data = trips
    .map((trip) => ({
      ...trip,
      stopCount: trip._count.stops,
      totalCost: trip.stops.reduce(
        (sum, stop) =>
          sum + stop.activities.reduce((activitySum, activity) => activitySum + activity.cost, 0),
        0,
      ),
      stops: undefined,
      _count: undefined,
    }))
    .sort((a, b) =>
      query.sortBy === "budget" ? (b.totalCost ?? 0) - (a.totalCost ?? 0) : 0,
    );

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

export async function createTrip(userId: string, input: CreateTripInput) {
  return prisma.trip.create({
    data: {
      ...input,
      userId,
      shareToken: input.isPublic ? randomUUID() : undefined,
      budget: { create: {} },
    },
    include: fullTripInclude,
  });
}

export async function getTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: fullTripInclude,
  });

  if (!trip) {
    throw notFound("Trip not found", "TRIP_NOT_FOUND");
  }

  if (trip.userId !== userId) {
    throw forbidden();
  }

  return withTotalCost(trip);
}

export async function updateTrip(userId: string, tripId: string, input: UpdateTripInput) {
  await assertOwnsTrip(userId, tripId);

  const data: Prisma.TripUpdateInput = {
    ...input,
    shareToken:
      input.isPublic === true
        ? randomUUID()
        : input.isPublic === false
          ? null
          : undefined,
  };

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data,
    include: fullTripInclude,
  });

  return withTotalCost(trip);
}

export async function deleteTrip(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);
  await prisma.trip.delete({ where: { id: tripId } });
  return { deleted: true };
}

export async function shareTrip(userId: string, tripId: string, requestUrl: string) {
  await assertOwnsTrip(userId, tripId);

  const shareToken = randomUUID();
  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: { isPublic: true, shareToken },
    select: { id: true, shareToken: true },
  });

  const baseUrl = process.env.FRONTEND_URL ?? new URL(requestUrl).origin;

  return {
    tripId: trip.id,
    shareToken: trip.shareToken,
    shareUrl: `${baseUrl.replace(/\/$/, "")}/share/${trip.shareToken}`,
  };
}

export async function revokeShare(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);
  await prisma.trip.update({
    where: { id: tripId },
    data: { isPublic: false, shareToken: null },
  });

  return { revoked: true };
}

export async function getSharedTrip(token: string) {
  const trip = await prisma.trip.findFirst({
    where: { shareToken: token, isPublic: true },
    include: {
      ...fullTripInclude,
      user: { select: communityUserSelect },
    },
  });

  if (!trip) {
    throw notFound("Shared itinerary not found", "SHARE_NOT_FOUND");
  }

  return withTotalCost(trip);
}

export async function listCommunityTrips(query: CommunityQuery) {
  const where: Prisma.TripWhereInput = {
    isPublic: true,
    shareToken: { not: null },
    ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    ...(query.city
      ? {
          stops: {
            some: {
              city: {
                OR: [
                  { name: { contains: query.city, mode: "insensitive" } },
                  { country: { contains: query.city, mode: "insensitive" } },
                ],
              },
            },
          },
        }
      : {}),
  };

  const [total, trips] = await prisma.$transaction([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      orderBy:
        query.sortBy === "popular"
          ? [{ stops: { _count: "desc" } }, { createdAt: "desc" }]
          : { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        user: { select: communityUserSelect },
        stops: {
          orderBy: { order: "asc" },
          include: { city: true, activities: { select: { cost: true } } },
        },
        _count: { select: { stops: true, notes: true } },
      },
    }),
  ]);

  return {
    data: trips.map(withTotalCost),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function copyPublicTrip(userId: string, tripId: string) {
  const source = await prisma.trip.findFirst({
    where: { id: tripId, isPublic: true },
    include: {
      stops: { include: { activities: true } },
      budget: true,
      checklist: true,
      notes: true,
    },
  });

  if (!source) {
    throw notFound("Public trip not found", "PUBLIC_TRIP_NOT_FOUND");
  }

  const copiedTripId = await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.create({
      data: {
        name: `${source.name} Copy`,
        description: source.description,
        coverPhoto: source.coverPhoto,
        startDate: source.startDate,
        endDate: source.endDate,
        isPublic: false,
        userId,
        budget: source.budget
          ? {
              create: {
                transport: source.budget.transport,
                stay: source.budget.stay,
                meals: source.budget.meals,
                activities: source.budget.activities,
                misc: source.budget.misc,
                totalAllocated: source.budget.totalAllocated,
              },
            }
          : { create: {} },
      },
    });

    const stopIdMap = new Map<string, string>();

    for (const stop of source.stops) {
      const newStop = await tx.stop.create({
        data: {
          tripId: trip.id,
          cityId: stop.cityId,
          startDate: stop.startDate,
          endDate: stop.endDate,
          order: stop.order,
        },
      });

      stopIdMap.set(stop.id, newStop.id);

      if (stop.activities.length > 0) {
        await tx.activity.createMany({
          data: stop.activities.map((activity) => ({
            stopId: newStop.id,
            name: activity.name,
            type: activity.type,
            cost: activity.cost,
            duration: activity.duration,
            description: activity.description,
            imageUrl: activity.imageUrl,
            startTime: activity.startTime,
          })),
        });
      }
    }

    if (source.checklist.length > 0) {
      await tx.checklistItem.createMany({
        data: source.checklist.map((item) => ({
          tripId: trip.id,
          name: item.name,
          category: item.category,
          isPacked: false,
        })),
      });
    }

    if (source.notes.length > 0) {
      await tx.note.createMany({
        data: source.notes.map((note) => ({
          tripId: trip.id,
          stopId: note.stopId ? (stopIdMap.get(note.stopId) ?? null) : null,
          userId,
          title: note.title,
          content: note.content,
        })),
      });
    }

    return trip.id;
  });

  return getTrip(userId, copiedTripId);
}

export async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers, 
    totalTrips, 
    tripsCreatedToday, 
    topCities,
    totalActivities,
    paidInvoices
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.trip.count({ where: { createdAt: { gte: today } } }),
    prisma.city.findMany({
      take: 10,
      orderBy: { stops: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        country: true,
        flag: true,
        _count: { select: { stops: true } },
      },
    }),
    prisma.activity.count(),
    prisma.invoice.findMany({
      where: { status: "paid" },
      select: {
        trip: {
          select: {
            budget: { select: { totalAllocated: true } }
          }
        },
        taxRate: true,
        discount: true
      }
    })
  ]);

  // Calculate total revenue from paid invoices
  // Revenue = subtotal + tax - discount
  // For simplicity, we use the trip budget's totalAllocated as subtotal if invoice subtotal isn't stored
  const totalRevenue = paidInvoices.reduce((acc, inv) => {
    const subtotal = inv.trip.budget?.totalAllocated || 0;
    const tax = subtotal * (inv.taxRate / 100);
    const discount = inv.discount;
    return acc + (subtotal + tax - discount);
  }, 0);

  const recentTripsRaw = await prisma.trip.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      budget: { select: { totalAllocated: true } },
      startDate: true,
      endDate: true,
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    }
  });

  const recentTrips = recentTripsRaw.map(t => ({
    ...t,
    totalCost: t.budget?.totalAllocated || 0,
    budget: undefined
  }));

  // Fetch trips for charts
  const chartTrips = await prisma.trip.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, budget: { select: { totalAllocated: true } } }
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tripsPerMonth = [];
  const budgetTrends = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const name = months[m];

    const monthTrips = chartTrips.filter(t => 
      t.createdAt.getMonth() === m && t.createdAt.getFullYear() === y
    );

    tripsPerMonth.push({ name, value: monthTrips.length });
    
    const avgBudget = monthTrips.length > 0 
      ? monthTrips.reduce((sum, t) => sum + (t.budget?.totalAllocated || 0), 0) / monthTrips.length
      : 0;
    
    budgetTrends.push({ name, value: Math.round(avgBudget) });
  }

  return { 
    totalUsers, 
    totalTrips, 
    tripsCreatedToday, 
    topCities,
    totalActivities,
    totalRevenue,
    recentTrips,
    tripsPerMonth,
    budgetTrends
  };
}

export async function listAdminUsers(page = 1, limit = 20) {
  const [total, data] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: { select: { trips: true } },
      },
    }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function deleteUserByAdmin(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  return { deleted: true };
}

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CityQuery } from "@/lib/schemas/city";

export async function listCities(query: CityQuery) {
  const where: Prisma.CityWhereInput = {
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { country: { contains: query.q, mode: "insensitive" } },
            { region: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(query.country
      ? { country: { equals: query.country, mode: "insensitive" } }
      : {}),
    ...(query.region ? { region: { equals: query.region, mode: "insensitive" } } : {}),
    ...(query.featured ? { popularity: { gte: 80 } } : {}),
  };

  const [total, data] = await prisma.$transaction([
    prisma.city.count({ where }),
    prisma.city.findMany({
      where,
      orderBy: [{ popularity: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        name: true,
        country: true,
        region: true,
        flag: true,
        costIndex: true,
        imageUrl: true,
        popularity: true,
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


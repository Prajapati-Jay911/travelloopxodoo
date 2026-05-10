import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export async function GET() {
  try {
    const [cities, trips, activities] = await Promise.all([
      prisma.city.count(),
      prisma.trip.count(),
      prisma.catalogActivity.count(),
    ]);

    return ok({
      cities,
      trips,
      activities,
    });
  } catch (error) {
    return fail(error);
  }
}

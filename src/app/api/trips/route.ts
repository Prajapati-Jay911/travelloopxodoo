import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, paginated, parseJson, parseSchema } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { createTripSchema, tripListQuerySchema } from "@/lib/schemas/trip";
import * as tripService from "@/lib/services/tripService";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const result = await tripService.listTrips(
      user.id,
      parseSchema(tripListQuerySchema, Object.fromEntries(request.nextUrl.searchParams)),
    );
    return paginated(result.data, result.pagination);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    return ok(await tripService.createTrip(user.id, await parseJson(request, createTripSchema)), 201);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


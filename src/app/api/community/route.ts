import type { NextRequest } from "next/server";
import { fail, optionsResponse, paginated, parseSchema } from "@/lib/api";
import { communityQuerySchema } from "@/lib/schemas/trip";
import * as tripService from "@/lib/services/tripService";

export async function GET(request: NextRequest) {
  try {
    const result = await tripService.listCommunityTrips(
      parseSchema(communityQuerySchema, Object.fromEntries(request.nextUrl.searchParams)),
    );
    return paginated(result.data, result.pagination);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


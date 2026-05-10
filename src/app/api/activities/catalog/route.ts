import type { NextRequest } from "next/server";
import { fail, optionsResponse, paginated, parseSchema } from "@/lib/api";
import { catalogActivityQuerySchema } from "@/lib/schemas/activity";
import * as activityService from "@/lib/services/activityService";

export async function GET(request: NextRequest) {
  try {
    const result = await activityService.listCatalogActivities(
      parseSchema(catalogActivityQuerySchema, Object.fromEntries(request.nextUrl.searchParams)),
    );
    return paginated(result.data, result.pagination);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


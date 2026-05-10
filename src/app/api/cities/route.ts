import type { NextRequest } from "next/server";
import { fail, optionsResponse, paginated, parseSchema } from "@/lib/api";
import { cityQuerySchema } from "@/lib/schemas/city";
import * as cityService from "@/lib/services/cityService";

export async function GET(request: NextRequest) {
  try {
    const result = await cityService.listCities(
      parseSchema(cityQuerySchema, Object.fromEntries(request.nextUrl.searchParams)),
    );
    return paginated(result.data, result.pagination);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;

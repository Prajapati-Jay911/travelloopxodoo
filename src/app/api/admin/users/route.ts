import type { NextRequest } from "next/server";
import { fail, optionsResponse, paginated } from "@/lib/api";
import { authenticate, requireRole } from "@/lib/middleware/auth";
import * as tripService from "@/lib/services/tripService";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, ["ADMIN"]);
    const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const result = await tripService.listAdminUsers(page, limit);
    return paginated(result.data, result.pagination);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


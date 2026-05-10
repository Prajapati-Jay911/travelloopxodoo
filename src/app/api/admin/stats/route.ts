import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse } from "@/lib/api";
import { authenticate, requireRole } from "@/lib/middleware/auth";
import * as tripService from "@/lib/services/tripService";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, ["ADMIN"]);
    return ok(await tripService.getAdminStats());
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


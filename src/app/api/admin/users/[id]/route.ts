import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse } from "@/lib/api";
import { authenticate, requireRole } from "@/lib/middleware/auth";
import * as tripService from "@/lib/services/tripService";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    requireRole(user, ["ADMIN"]);
    return ok(await tripService.deleteUserByAdmin(id));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;

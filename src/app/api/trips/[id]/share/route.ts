import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import * as tripService from "@/lib/services/tripService";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await tripService.shareTrip(user.id, id, request.url));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await tripService.revokeShare(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


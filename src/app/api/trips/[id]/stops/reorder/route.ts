import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { reorderStopsSchema } from "@/lib/schemas/stop";
import * as stopService from "@/lib/services/stopService";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await stopService.reorderStops(user.id, id, await parseJson(request, reorderStopsSchema)));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


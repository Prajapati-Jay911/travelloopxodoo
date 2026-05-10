import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { createStopSchema } from "@/lib/schemas/stop";
import * as stopService from "@/lib/services/stopService";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await stopService.listStops(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await stopService.createStop(user.id, id, await parseJson(request, createStopSchema)), 201);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


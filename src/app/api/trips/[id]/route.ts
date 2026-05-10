import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { updateTripSchema } from "@/lib/schemas/trip";
import * as tripService from "@/lib/services/tripService";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await tripService.getTrip(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await tripService.updateTrip(user.id, id, await parseJson(request, updateTripSchema)));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await tripService.deleteTrip(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


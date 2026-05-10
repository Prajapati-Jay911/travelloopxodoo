import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { updateStopSchema } from "@/lib/schemas/stop";
import * as stopService from "@/lib/services/stopService";

type Params = { params: Promise<{ id: string; stopId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const [{ id, stopId }, user] = await Promise.all([params, authenticate(request)]);
    return ok(
      await stopService.updateStop(
        user.id,
        id,
        stopId,
        await parseJson(request, updateStopSchema),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const [{ id, stopId }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await stopService.deleteStop(user.id, id, stopId));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


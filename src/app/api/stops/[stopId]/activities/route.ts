import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { activityBodySchema } from "@/lib/schemas/activity";
import * as activityService from "@/lib/services/activityService";

type Params = { params: Promise<{ stopId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const [{ stopId }, user] = await Promise.all([params, authenticate(request)]);
    return ok(
      await activityService.addActivity(
        user.id,
        stopId,
        await parseJson(request, activityBodySchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


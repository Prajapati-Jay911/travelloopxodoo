import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse } from "@/lib/api";
import * as tripService from "@/lib/services/tripService";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    return ok(await tripService.getSharedTrip(token));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { unauthorized } from "@/lib/errors";
import { refreshSchema } from "@/lib/schemas/auth";
import * as authService from "@/lib/services/authService";

export async function POST(request: NextRequest) {
  try {
    const header = request.headers.get("authorization");
    const body = header?.startsWith("Bearer ")
      ? { token: header.slice("Bearer ".length) }
      : await parseJson(request, refreshSchema);
    if (!body.token) {
      throw unauthorized("Refresh token is required");
    }

    return ok(await authService.refresh(body.token));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


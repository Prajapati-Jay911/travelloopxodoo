import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { assertRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/schemas/auth";
import * as authService from "@/lib/services/authService";

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(`login:${request.headers.get("x-forwarded-for") ?? "local"}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    return ok(await authService.login(await parseJson(request, loginSchema)));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


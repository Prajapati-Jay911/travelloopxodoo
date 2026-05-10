import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { assertRateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/schemas/auth";
import * as authService from "@/lib/services/authService";

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(`register:${request.headers.get("x-forwarded-for") ?? "local"}`, {
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    return ok(await authService.register(await parseJson(request, registerSchema)), 201);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


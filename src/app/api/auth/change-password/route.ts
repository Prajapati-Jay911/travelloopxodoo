import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { changePasswordSchema } from "@/lib/schemas/auth";
import * as authService from "@/lib/services/authService";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    return ok(
      await authService.changePassword(
        user.id,
        await parseJson(request, changePasswordSchema),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


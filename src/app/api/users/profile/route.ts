import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { updateProfileSchema } from "@/lib/schemas/user";
import * as userService from "@/lib/services/userService";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    return ok(await userService.getProfile(user.id));
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    return ok(
      await userService.updateProfile(user.id, await parseJson(request, updateProfileSchema)),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticate(request);
    return ok(await userService.deleteProfile(user.id));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;

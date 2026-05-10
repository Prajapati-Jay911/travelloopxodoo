import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { updateChecklistItemSchema } from "@/lib/schemas/checklist";
import * as checklistService from "@/lib/services/checklistService";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(
      await checklistService.updateChecklistItem(
        user.id,
        id,
        await parseJson(request, updateChecklistItemSchema),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await checklistService.deleteChecklistItem(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


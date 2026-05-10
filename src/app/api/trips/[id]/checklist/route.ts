import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { createChecklistItemSchema } from "@/lib/schemas/checklist";
import * as checklistService from "@/lib/services/checklistService";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await checklistService.listChecklist(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(
      await checklistService.createChecklistItem(
        user.id,
        id,
        await parseJson(request, createChecklistItemSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await checklistService.resetChecklist(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


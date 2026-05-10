import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { budgetSchema } from "@/lib/schemas/budget";
import * as budgetService from "@/lib/services/budgetService";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await budgetService.getBudget(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await budgetService.upsertBudget(user.id, id, await parseJson(request, budgetSchema)));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


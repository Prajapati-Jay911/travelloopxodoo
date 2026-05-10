import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { updateNoteSchema } from "@/lib/schemas/note";
import * as noteService from "@/lib/services/noteService";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await noteService.updateNote(user.id, id, await parseJson(request, updateNoteSchema)));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await noteService.deleteNote(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


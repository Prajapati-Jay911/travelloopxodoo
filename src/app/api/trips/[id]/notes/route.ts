import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson, parseSchema } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { createNoteSchema, noteQuerySchema } from "@/lib/schemas/note";
import * as noteService from "@/lib/services/noteService";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(
      await noteService.listNotes(
        user.id,
        id,
        parseSchema(noteQuerySchema, Object.fromEntries(request.nextUrl.searchParams)),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await noteService.createNote(user.id, id, await parseJson(request, createNoteSchema)), 201);
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;


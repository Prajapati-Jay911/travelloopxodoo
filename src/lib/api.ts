import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { ApiError, badRequest, normalizeError } from "@/lib/errors";

const allowedOrigin = process.env.FRONTEND_URL ?? process.env.NEXT_PUBLIC_FRONTEND_URL ?? "*";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
  };
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status, headers: corsHeaders() },
  );
}

export function paginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
  status = 200,
) {
  return NextResponse.json(
    { success: true, data, pagination },
    { status, headers: corsHeaders() },
  );
}

export function fail(error: unknown) {
  const apiError = normalizeError(error);

  return NextResponse.json(
    {
      success: false,
      error: apiError.message,
      code: apiError.code,
      ...(apiError.details ? { details: apiError.details } : {}),
    },
    { status: apiError.status, headers: corsHeaders() },
  );
}

export function optionsResponse() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON", "INVALID_JSON");
  }

  return parseSchema(schema, body);
}

export function parseSchema<T>(schema: ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw validationError(result.error);
  }

  return result.data;
}

export function validationError(error: ZodError) {
  return new ApiError("Validation failed", 400, "VALIDATION_ERROR", {
    fields: error.flatten().fieldErrors,
  });
}


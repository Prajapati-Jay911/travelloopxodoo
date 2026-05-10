import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "INTERNAL_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function badRequest(
  message: string,
  code = "BAD_REQUEST",
  details?: unknown,
) {
  return new ApiError(message, 400, code, details);
}

export function unauthorized(message = "Authentication is required") {
  return new ApiError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "You do not have access to this resource") {
  return new ApiError(message, 403, "FORBIDDEN");
}

export function notFound(message = "Resource not found", code = "NOT_FOUND") {
  return new ApiError(message, 404, code);
}

export function conflict(message = "Resource already exists", code = "CONFLICT") {
  return new ApiError(message, 409, code);
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return conflict("A record with this value already exists", "UNIQUE_CONSTRAINT");
    }

    if (error.code === "P2025") {
      return notFound("Record not found", "RECORD_NOT_FOUND");
    }
  }

  console.error(error);
  return new ApiError("Something went wrong", 500, "INTERNAL_ERROR");
}


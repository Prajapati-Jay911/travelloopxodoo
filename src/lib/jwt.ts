import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { unauthorized } from "@/lib/errors";

export type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 24) {
    throw new Error("JWT_SECRET must be configured with at least 24 characters");
  }

  return secret;
}

export function signToken(payload: TokenPayload) {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, jwtSecret(), {
    expiresIn,
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, jwtSecret());

    if (
      typeof decoded === "object" &&
      typeof decoded.sub === "string" &&
      typeof decoded.email === "string" &&
      typeof decoded.role === "string"
    ) {
      return {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role as UserRole,
      };
    }
  } catch {
    throw unauthorized("Invalid or expired token");
  }

  throw unauthorized("Invalid token");
}

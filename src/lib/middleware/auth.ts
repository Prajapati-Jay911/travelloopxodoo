import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import { forbidden, unauthorized } from "@/lib/errors";
import { verifyToken, type TokenPayload } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export type AuthUser = TokenPayload & {
  id: string;
};

export async function authenticate(request: NextRequest): Promise<AuthUser> {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    throw unauthorized();
  }

  const payload = verifyToken(header.slice("Bearer ".length));
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw unauthorized("User no longer exists");
  }

  return {
    id: user.id,
    sub: user.id,
    email: user.email,
    role: user.role,
  };
}

export function requireRole(user: AuthUser, roles: UserRole[]) {
  if (!roles.includes(user.role)) {
    throw forbidden("Admin access is required");
  }
}

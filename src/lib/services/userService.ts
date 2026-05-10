import { prisma } from "@/lib/prisma";
import { publicUserSelect } from "@/lib/services/userSelect";
import { notFound } from "@/lib/errors";
import type { UpdateProfileInput } from "@/lib/schemas/user";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw notFound("User not found", "USER_NOT_FOUND");
  }

  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: publicUserSelect,
  });
}

export async function deleteProfile(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  return { deleted: true };
}


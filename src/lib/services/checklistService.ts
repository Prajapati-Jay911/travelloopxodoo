import { ChecklistCategory } from "@prisma/client";
import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type {
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from "@/lib/schemas/checklist";

async function assertOwnsTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) {
    throw notFound("Trip not found", "TRIP_NOT_FOUND");
  }

  if (trip.userId !== userId) {
    throw forbidden();
  }
}

async function getChecklistOwner(itemId: string) {
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    select: { trip: { select: { userId: true } } },
  });

  if (!item) {
    throw notFound("Checklist item not found", "CHECKLIST_ITEM_NOT_FOUND");
  }

  return item.trip.userId;
}

export async function listChecklist(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);

  const items = await prisma.checklistItem.findMany({
    where: { tripId },
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
  });

  const defaultCategories = Object.values(ChecklistCategory);
  const groups: Record<string, typeof items> = {};

  // Initialize with defaults to maintain consistent section headers
  defaultCategories.forEach((cat) => {
    groups[cat] = [];
  });

  // Group items, creating new categories as needed
  items.forEach((item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  });

  return groups;
}

export async function createChecklistItem(
  userId: string,
  tripId: string,
  input: CreateChecklistItemInput,
) {
  await assertOwnsTrip(userId, tripId);

  return prisma.checklistItem.create({
    data: { ...input, tripId },
  });
}

export async function updateChecklistItem(
  userId: string,
  itemId: string,
  input: UpdateChecklistItemInput,
) {
  if ((await getChecklistOwner(itemId)) !== userId) {
    throw forbidden();
  }

  return prisma.checklistItem.update({
    where: { id: itemId },
    data: input,
  });
}

export async function deleteChecklistItem(userId: string, itemId: string) {
  if ((await getChecklistOwner(itemId)) !== userId) {
    throw forbidden();
  }

  await prisma.checklistItem.delete({ where: { id: itemId } });
  return { deleted: true };
}

export async function resetChecklist(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);

  await prisma.checklistItem.updateMany({
    where: { tripId },
    data: { isPacked: false },
  });

  return listChecklist(userId, tripId);
}


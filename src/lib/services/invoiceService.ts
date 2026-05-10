import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound, forbidden } from "@/lib/errors";

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

export async function getInvoice(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);

  // Auto-generate invoice number if it doesn't exist
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      travelers: true,
      invoice: true,
      stops: {
        include: {
          activities: true,
        },
      },
      budget: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!trip) throw notFound("Trip not found");

  let invoice = trip.invoice;

  if (!invoice) {
    const invoiceNumber = `INV-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(Date.now() / 10000).toString().slice(-5)}`;
    invoice = await prisma.invoice.create({
      data: {
        tripId,
        invoiceNumber,
        status: "pending",
        taxRate: 5,
        discount: 0,
      },
    });
  }

  // Calculate totals from activities
  const activities = trip.stops.flatMap(s => s.activities);
  const subtotal = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const grandTotal = subtotal + taxAmount - invoice.discount;

  return {
    ...invoice,
    subtotal,
    taxAmount,
    grandTotal,
    activities,
    trip: {
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelers: trip.travelers,
      owner: `${trip.user.firstName} ${trip.user.lastName}`,
    },
    budget: trip.budget,
  };
}

export async function updateInvoice(userId: string, tripId: string, data: Prisma.InvoiceUpdateInput) {
  await assertOwnsTrip(userId, tripId);

  return prisma.invoice.update({
    where: { tripId },
    data,
  });
}

export async function markAsPaid(userId: string, tripId: string) {
  await assertOwnsTrip(userId, tripId);

  return prisma.invoice.update({
    where: { tripId },
    data: { status: "paid" },
  });
}

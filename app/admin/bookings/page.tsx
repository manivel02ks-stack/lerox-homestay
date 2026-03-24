import { prisma } from "@/lib/prisma";
import { AdminBookingsClient } from "./AdminBookingsClient";

async function getBookings() {
  return prisma.booking.findMany({
    include: {
      room: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all guest reservations
        </p>
      </div>
      <AdminBookingsClient initialBookings={bookings as any} />
    </div>
  );
}

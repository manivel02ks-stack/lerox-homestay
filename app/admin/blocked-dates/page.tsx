import { prisma } from "@/lib/prisma";
import { differenceInDays, addDays, startOfDay } from "date-fns";
import BlockedDatesClient from "./BlockedDatesClient";

async function getData() {
  const [rooms, blockedDates, confirmedBookings] = await Promise.all([
    prisma.room.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.blockedDate.findMany({
      where: { date: { gte: new Date() } },
      include: { room: { select: { name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        checkOut: { gte: new Date() },
      },
      select: {
        roomId: true,
        checkIn: true,
        checkOut: true,
        guestName: true,
        id: true,
        room: { select: { name: true } },
      },
    }),
  ]);

  // Expand each confirmed booking into individual night dates
  const bookedDates: { roomId: string; roomName: string; date: string; bookingId: string; guestName: string | null }[] = [];
  for (const booking of confirmedBookings) {
    const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
    for (let i = 0; i < (nights > 0 ? nights : 1); i++) {
      bookedDates.push({
        roomId: booking.roomId,
        roomName: booking.room.name,
        date: startOfDay(addDays(new Date(booking.checkIn), i)).toISOString(),
        bookingId: booking.id.slice(-8).toUpperCase(),
        guestName: booking.guestName,
      });
    }
  }

  return { rooms, blockedDates, bookedDates };
}

export default async function BlockedDatesPage() {
  const { rooms, blockedDates, bookedDates } = await getData();

  return (
    <BlockedDatesClient
      initialRooms={rooms}
      initialBlockedDates={blockedDates.map((bd) => ({
        ...bd,
        date: bd.date.toISOString(),
      }))}
      initialBookedDates={bookedDates}
    />
  );
}

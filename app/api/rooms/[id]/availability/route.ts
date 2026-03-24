import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eachDayOfInterval } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

    // Get start and end of range (6 months from now to be safe)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year + 1, month - 1, 0); // 1 year range

    // Get confirmed/pending bookings
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: params.id,
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          { checkIn: { lte: endDate }, checkOut: { gte: startDate } },
        ],
      },
      select: { checkIn: true, checkOut: true },
    });

    // Get manually blocked dates
    const blocked = await prisma.blockedDate.findMany({
      where: {
        roomId: params.id,
        date: { gte: startDate, lte: endDate },
      },
      select: { date: true },
    });

    // Expand booking ranges into individual dates
    const bookedDates: string[] = [];

    for (const booking of bookings) {
      const days = eachDayOfInterval({
        start: new Date(booking.checkIn),
        end: new Date(booking.checkOut),
      });
      days.forEach((day) => {
        bookedDates.push(day.toISOString().split("T")[0]);
      });
    }

    // Add blocked dates
    blocked.forEach((bd) => {
      bookedDates.push(new Date(bd.date).toISOString().split("T")[0]);
    });

    // Deduplicate
    const uniqueDates = Array.from(new Set(bookedDates));

    return NextResponse.json({ bookedDates: uniqueDates });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bookingSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().min(1),
  totalPrice: z.number().min(0),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  specialRequests: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isAdmin = (session.user as any)?.role === "ADMIN";
    const all = searchParams.get("all") === "true";

    const where: any = {};
    if (!isAdmin || !all) {
      where.userId = (session.user as any).id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: { select: { name: true, images: true, price: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = bookingSchema.parse(body);

    const checkIn = new Date(validated.checkIn);
    const checkOut = new Date(validated.checkOut);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    // Check room exists and is active
    const room = await prisma.room.findUnique({
      where: { id: validated.roomId },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: "Room is not available" },
        { status: 400 }
      );
    }

    if (validated.guests > room.maxGuests) {
      return NextResponse.json(
        { error: `Room maximum capacity is ${room.maxGuests} guests` },
        { status: 400 }
      );
    }

    // Check for conflicting bookings (double booking prevention)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: validated.roomId,
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Room is already booked for the selected dates" },
        { status: 409 }
      );
    }

    // Check for blocked dates
    const blockedDates = await prisma.blockedDate.findFirst({
      where: {
        roomId: validated.roomId,
        date: { gte: checkIn, lt: checkOut },
      },
    });

    if (blockedDates) {
      return NextResponse.json(
        { error: "Some dates in your selection are blocked" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        roomId: validated.roomId,
        userId: (session.user as any).id,
        checkIn,
        checkOut,
        guests: validated.guests,
        totalPrice: validated.totalPrice,
        status: "PENDING",
        guestName: validated.guestName,
        guestEmail: validated.guestEmail,
        guestPhone: validated.guestPhone,
        specialRequests: validated.specialRequests,
      },
      include: {
        room: { select: { name: true } },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — public, returns visible reviews for a room
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reviews = await prisma.review.findMany({
    where: { roomId: params.id, isVisible: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, guestName: true, rating: true, comment: true, adminReply: true, adminRepliedAt: true, createdAt: true },
  });
  return NextResponse.json({ reviews });
}

// POST — logged-in guest submits a review (must have a COMPLETED booking for this room)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rating, comment, bookingId } = await req.json();

  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  if (!comment?.trim())
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });

  // Verify the booking belongs to this user, this room, and is COMPLETED
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      roomId: params.id,
      userId: (session.user as any).id,
      status: "COMPLETED",
    },
  });
  if (!booking)
    return NextResponse.json({ error: "No completed booking found for this room" }, { status: 403 });

  // Prevent duplicate review for same booking
  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing)
    return NextResponse.json({ error: "Review already submitted for this booking" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      roomId: params.id,
      bookingId,
      guestName: booking.guestName || session.user?.name || "Guest",
      rating,
      comment: comment.trim(),
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        ...(roomId && { roomId }),
        date: { gte: new Date() },
      },
      include: {
        room: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ blockedDates });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blocked dates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, date, reason } = await req.json();

    if (!roomId || !date) {
      return NextResponse.json(
        { error: "Room ID and date are required" },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const blockedDate = await prisma.blockedDate.upsert({
      where: {
        roomId_date: {
          roomId,
          date: new Date(date),
        },
      },
      update: { reason },
      create: {
        roomId,
        date: new Date(date),
        reason,
      },
    });

    return NextResponse.json({ blockedDate }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Date already blocked" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to block date" },
      { status: 500 }
    );
  }
}

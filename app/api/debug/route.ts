import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    // Mask password for safety
    const masked = dbUrl.replace(/:([^@]+)@/, ":****@");

    // Test connection
    const roomCount = await prisma.room.count();

    return NextResponse.json({
      status: "connected",
      dbUrl: masked,
      roomCount,
    });
  } catch (error: any) {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    const masked = dbUrl.replace(/:([^@]+)@/, ":****@");

    return NextResponse.json({
      status: "error",
      dbUrl: masked,
      error: error.message,
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ exists: false, hasPassword: false });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, role: true },
  });

  return NextResponse.json({
    exists: !!user,
    hasPassword: !!(user?.passwordHash),
    isAdmin: user?.role === "ADMIN",
  });
}

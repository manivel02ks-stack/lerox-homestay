import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// GET - list all admin users
export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ admins });
}

// POST - create new admin or reset password
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { action, email, name, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (action === "create") {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }
    const user = await prisma.user.create({
      data: { email, name: name || email.split("@")[0], role: Role.ADMIN, passwordHash, emailVerified: new Date() },
    });
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  }

  if (action === "reset") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE - remove admin user
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { email } = await req.json();
  if (email === session?.user?.email) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  await prisma.user.delete({ where: { email } });
  return NextResponse.json({ success: true });
}

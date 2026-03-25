import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — admin toggles visibility OR guest edits their own review
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const body = await req.json();

  if (isAdmin) {
    const data: any = {};
    if (body.isVisible !== undefined) data.isVisible = body.isVisible;
    if (body.adminReply !== undefined) {
      data.adminReply     = body.adminReply?.trim() || null;
      data.adminRepliedAt = body.adminReply?.trim() ? new Date() : null;
    }
    const review = await prisma.review.update({ where: { id: params.id }, data });
    return NextResponse.json({ review });
  }

  // Guest: can only edit their own review (via the booking they made)
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { booking: { select: { userId: true } } },
  });

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.booking?.userId !== (session.user as any).id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!body.rating || body.rating < 1 || body.rating > 5)
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  if (!body.comment?.trim())
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: { rating: body.rating, comment: body.comment.trim() },
  });
  return NextResponse.json({ review: updated });
}

// DELETE — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

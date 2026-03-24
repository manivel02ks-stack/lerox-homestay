import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, amount } = await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "Booking ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Charge 50% advance — remaining 50% collected at check-in
    const advanceAmount = Math.round(amount * 0.5);

    // Create Razorpay order for 50%
    // receipt must be ≤ 40 chars
    const order = await razorpay.orders.create({
      amount: Math.round(advanceAmount * 100), // Convert to paise
      currency: "INR",
      receipt: bookingId.slice(-40),
      notes: {
        bookingId,
        userId: (session.user as any).id,
        paymentType: "advance_50_percent",
      },
    });

    // Save order ID and advance amount to booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        razorpayOrderId: order.id,
        advancePaid: advanceAmount,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,          // advance in paise
      advanceAmount,                  // advance in rupees
      balanceAmount: amount - advanceAmount, // remaining in rupees
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Create order error:", JSON.stringify(error, null, 2));
    const message = error?.error?.description || error?.message || "Failed to create payment order";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation, sendBookingCancellation, sendBookingCompletion } from "@/lib/email";
import { sendBookingConfirmationWhatsApp, sendBookingCancellationWhatsApp, sendBookingCompletionWhatsApp } from "@/lib/whatsapp";
import { differenceInDays, addDays, startOfDay } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        room: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Allow access only to owner or admin
    const isAdmin = (session.user as any)?.role === "ADMIN";
    if (!isAdmin && booking.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch full booking details before updating (needed for email)
    const existing = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        room: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.paymentId && { paymentId: body.paymentId }),
        ...(body.razorpayOrderId && { razorpayOrderId: body.razorpayOrderId }),
      },
    });

    // Auto-block dates when CONFIRMED, unblock when CANCELLED/PENDING
    if (body.status === "CONFIRMED" && existing.status !== "CONFIRMED") {
      // Build one entry per night (checkIn inclusive, checkOut exclusive)
      const nights = differenceInDays(
        new Date(existing.checkOut),
        new Date(existing.checkIn)
      );
      const datesToBlock = Array.from({ length: nights > 0 ? nights : 1 }, (_, i) =>
        startOfDay(addDays(new Date(existing.checkIn), i))
      );

      await prisma.$transaction(
        datesToBlock.map((date) =>
          prisma.blockedDate.upsert({
            where: { roomId_date: { roomId: existing.roomId, date } },
            update: { reason: `Booking #${existing.id.slice(-8).toUpperCase()} confirmed` },
            create: {
              roomId: existing.roomId,
              date,
              reason: `Booking #${existing.id.slice(-8).toUpperCase()} confirmed`,
            },
          })
        )
      );
    }

    if (
      (body.status === "CANCELLED" || body.status === "PENDING") &&
      existing.status === "CONFIRMED"
    ) {
      // Remove the dates that were blocked for this booking
      const nights = differenceInDays(
        new Date(existing.checkOut),
        new Date(existing.checkIn)
      );
      const datesToUnblock = Array.from({ length: nights > 0 ? nights : 1 }, (_, i) =>
        startOfDay(addDays(new Date(existing.checkIn), i))
      );

      await prisma.blockedDate.deleteMany({
        where: {
          roomId: existing.roomId,
          date: { in: datesToUnblock },
        },
      });
    }

    // Send status-change emails + WhatsApp (non-blocking)
    const recipientEmail = existing.guestEmail || existing.user.email;
    const guestName      = existing.guestName  || existing.user.name || "Guest";
    const guestPhone     = existing.guestPhone ?? null;

    console.log(`[Booking ${params.id}] Status change: ${existing.status} → ${body.status}`);
    console.log(`[Booking ${params.id}] guestPhone=${guestPhone} email=${recipientEmail}`);

    if (body.status && body.status !== existing.status) {
      if (body.status === "CONFIRMED") {
        const nights = differenceInDays(
          new Date(existing.checkOut),
          new Date(existing.checkIn)
        );
        const confirmParams = {
          guestName,
          bookingId:   existing.id,
          roomName:    existing.room.name,
          checkIn:     existing.checkIn,
          checkOut:    existing.checkOut,
          guests:      existing.guests,
          nights:      nights > 0 ? nights : 1,
          totalPrice:  existing.totalPrice,
          advancePaid: existing.advancePaid ?? undefined,
        };
        if (recipientEmail) {
          sendBookingConfirmation({ ...confirmParams, guestEmail: recipientEmail })
            .catch((err) => console.error("Confirmation email error:", err));
        }
        if (guestPhone) {
          console.log(`[WhatsApp] Sending confirmation to ${guestPhone}`);
          sendBookingConfirmationWhatsApp({ ...confirmParams, guestPhone })
            .then(() => console.log(`[WhatsApp] Confirmation sent OK to ${guestPhone}`))
            .catch((err) => console.error("[WhatsApp] Confirmation error:", err?.message, err?.code, err?.moreInfo));
        } else {
          console.warn("[WhatsApp] Skipped — no guestPhone on booking");
        }

      } else if (body.status === "CANCELLED") {
        const cancelParams = {
          guestName,
          bookingId:  existing.id,
          roomName:   existing.room.name,
          checkIn:    existing.checkIn,
          checkOut:   existing.checkOut,
        };
        if (recipientEmail) {
          sendBookingCancellation({ ...cancelParams, guestEmail: recipientEmail, totalPrice: existing.totalPrice })
            .catch((err) => console.error("Cancellation email error:", err));
        }
        if (guestPhone) {
          console.log(`[WhatsApp] Sending cancellation to ${guestPhone}`);
          sendBookingCancellationWhatsApp({ ...cancelParams, guestPhone })
            .then(() => console.log(`[WhatsApp] Cancellation sent OK to ${guestPhone}`))
            .catch((err) => console.error("[WhatsApp] Cancellation error:", err?.message, err?.code, err?.moreInfo));
        }

      } else if (body.status === "COMPLETED") {
        const completeParams = {
          guestName,
          bookingId:  existing.id,
          roomName:   existing.room.name,
        };
        if (recipientEmail) {
          sendBookingCompletion({ ...completeParams, guestEmail: recipientEmail, checkIn: existing.checkIn, checkOut: existing.checkOut })
            .catch((err) => console.error("Completion email error:", err));
        }
        if (guestPhone) {
          console.log(`[WhatsApp] Sending completion to ${guestPhone}`);
          sendBookingCompletionWhatsApp({ ...completeParams, guestPhone })
            .then(() => console.log(`[WhatsApp] Completion sent OK to ${guestPhone}`))
            .catch((err) => console.error("[WhatsApp] Completion error:", err?.message, err?.code, err?.moreInfo));
        }
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isAdmin = (session.user as any)?.role === "ADMIN";
    if (!isAdmin && booking.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.booking.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}

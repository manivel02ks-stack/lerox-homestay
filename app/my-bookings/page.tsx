"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import {
  Calendar,
  Users,
  ArrowLeft,
  Loader2,
  BedDouble,
  Clock,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Printer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  advancePaid: number | null;
  status: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  paymentId: string | null;
  createdAt: string;
  room: { name: string; images: string[]; price: number };
}

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  PENDING:   { label: "Pending",   variant: "warning",     icon: Clock        },
  CONFIRMED: { label: "Confirmed", variant: "success",     icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: XCircle      },
  COMPLETED: { label: "Completed", variant: "secondary",   icon: BadgeCheck   },
};

function printBooking(booking: Booking, guestEmail: string | null | undefined) {
  const nights  = Math.max(1, differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn)));
  const balance = booking.advancePaid != null ? booking.totalPrice - booking.advancePaid : null;

  const win = window.open("", "_blank", "width=800,height=700");
  if (!win) return;

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Confirmation – Le Rox Home-Stay</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #1a1a1a; background: #fff; padding: 40px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 28px; }
    .brand-name { font-size: 32px; font-weight: 700; color: #1e3a5f; letter-spacing: -0.5px; }
    .brand-sub  { font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #c07a6a; margin-top: 2px; }
    .confirmed-badge { background: #16a34a; color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; font-family: sans-serif; letter-spacing: 0.5px; }

    /* Title */
    .title { font-size: 22px; font-weight: 700; color: #1e3a5f; margin-bottom: 6px; }
    .ref   { font-size: 13px; color: #666; font-family: monospace; margin-bottom: 28px; }

    /* Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
    .info-box { background: #f8f9fb; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; }
    .info-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-family: sans-serif; margin-bottom: 4px; }
    .info-box .value { font-size: 15px; font-weight: 600; color: #1a1a1a; }

    /* Payment table */
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1e3a5f; font-family: sans-serif; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-family: sans-serif; }
    td, th { padding: 10px 14px; text-align: left; font-size: 13px; }
    th { background: #f1f5f9; color: #555; font-weight: 600; }
    tr:nth-child(even) td { background: #f9fbfd; }
    .highlight-green { background: #f0fdf4 !important; color: #16a34a; font-weight: 700; }
    .highlight-orange { background: #fff7ed !important; color: #ea580c; font-weight: 700; }
    .total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid #e2e8f0; }

    /* Footer */
    .footer { border-top: 2px solid #e2e8f0; padding-top: 18px; margin-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer-note { font-size: 11px; color: #888; font-family: sans-serif; line-height: 1.6; }
    .footer-contact { font-size: 12px; color: #1e3a5f; font-family: sans-serif; text-align: right; line-height: 1.8; }

    /* Notice box */
    .notice { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #9a3412; font-family: sans-serif; margin-bottom: 28px; }

    @media print {
      body { padding: 20px; }
      button { display: none; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-name">Le Rox</div>
      <div class="brand-sub">Home Stay · Pondicherry</div>
    </div>
    <div class="confirmed-badge">✓ Confirmed</div>
  </div>

  <!-- Title -->
  <div class="title">Booking Confirmation</div>
  <div class="ref">
    Ref: #${booking.id.slice(-8).toUpperCase()} &nbsp;·&nbsp;
    Booked on ${format(new Date(booking.createdAt), "dd MMM yyyy, hh:mm a")}
  </div>

  <!-- Guest + Room details -->
  <div class="grid-2">
    <div class="info-box">
      <div class="label">Guest Name</div>
      <div class="value">${booking.guestName || "Guest"}</div>
    </div>
    <div class="info-box">
      <div class="label">Email</div>
      <div class="value" style="font-size:13px;">${guestEmail || "—"}</div>
    </div>
    <div class="info-box">
      <div class="label">Room</div>
      <div class="value">${booking.room.name}</div>
    </div>
    <div class="info-box">
      <div class="label">Guests · Nights</div>
      <div class="value">${booking.guests} guest${booking.guests !== 1 ? "s" : ""} · ${nights} night${nights !== 1 ? "s" : ""}</div>
    </div>
    <div class="info-box">
      <div class="label">Check-in</div>
      <div class="value">${format(new Date(booking.checkIn), "EEE, dd MMM yyyy")}</div>
    </div>
    <div class="info-box">
      <div class="label">Check-out</div>
      <div class="value">${format(new Date(booking.checkOut), "EEE, dd MMM yyyy")}</div>
    </div>
  </div>

  <!-- Balance due notice -->
  ${balance && balance > 0 ? `
  <div class="notice">
    ⚠️ <strong>Balance Due at Check-in:</strong> ${formatPrice(balance)} — payable via Cash or UPI at the property.
  </div>` : ""}

  <!-- Payment breakdown -->
  <div class="section-title">Payment Summary</div>
  <table>
    <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
    <tr>
      <td>Room charges (${nights} night${nights !== 1 ? "s" : ""} × ${formatPrice(booking.room.price)})</td>
      <td style="text-align:right">${formatPrice(booking.totalPrice)}</td>
    </tr>
    ${booking.advancePaid != null ? `
    <tr class="highlight-green">
      <td>✅ Advance Paid (online via Razorpay)</td>
      <td style="text-align:right">${formatPrice(booking.advancePaid)}</td>
    </tr>
    ${balance && balance > 0 ? `
    <tr class="highlight-orange">
      <td>⚠️ Balance Due at Check-in (Cash / UPI)</td>
      <td style="text-align:right">${formatPrice(balance)}</td>
    </tr>` : ""}` : ""}
    <tr class="total-row">
      <td>Total Booking Amount</td>
      <td style="text-align:right">${formatPrice(booking.totalPrice)}</td>
    </tr>
  </table>

  ${booking.paymentId ? `
  <p style="font-size:11px;color:#888;font-family:monospace;margin-bottom:28px;">
    Payment ID: ${booking.paymentId}
  </p>` : ""}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-note">
      • Check-in after 2:00 PM &nbsp;·&nbsp; Check-out before 12:00 PM<br/>
      • Please carry a valid photo ID at check-in<br/>
      • This is your official booking confirmation
    </div>
    <div class="footer-contact">
      <strong>Le Rox Home-Stay</strong><br/>
      66, 7th Cross Rd, Velrampet<br/>
      Puducherry – 605004<br/>
      +91 93422 22799 · leroxstay@gmail.com
    </div>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`);
  win.document.close();
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/my-bookings");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((d) => setBookings((d.bookings || []).slice(0, 10)))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-500 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing your last {bookings.length} reservation{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <BedDouble className="h-14 w-14 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-gray-400 text-sm mb-6">
                You haven't made any reservations yet. Explore our rooms and book your stay!
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/rooms">Explore Rooms</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const cfg    = statusConfig[booking.status] ?? statusConfig.PENDING;
              const Icon   = cfg.icon;
              const nights = Math.max(1, differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn)));
              const balance = booking.advancePaid != null ? booking.totalPrice - booking.advancePaid : null;

              return (
                <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                      {/* Left */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-lg">{booking.room.name}</h3>
                          <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs">
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-400 font-mono">
                          Ref: #{booking.id.slice(-8).toUpperCase()}
                          <span className="ml-3 font-sans">
                            Booked on {format(new Date(booking.createdAt), "dd MMM yyyy")}
                          </span>
                        </p>

                        <Separator />

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Check-in</p>
                              <p className="font-medium text-gray-800">{format(new Date(booking.checkIn), "dd MMM yyyy")}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Check-out</p>
                              <p className="font-medium text-gray-800">{format(new Date(booking.checkOut), "dd MMM yyyy")}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Guests · Nights</p>
                              <p className="font-medium text-gray-800">
                                {booking.guests} guest{booking.guests !== 1 ? "s" : ""} · {nights} night{nights !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right — payment + print */}
                      <div className="sm:text-right sm:min-w-[170px] space-y-2">
                        <div>
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="text-xl font-bold text-gray-900">{formatPrice(booking.totalPrice)}</p>
                        </div>
                        {booking.advancePaid != null && (
                          <>
                            <div>
                              <p className="text-xs text-green-600">✅ Advance Paid</p>
                              <p className="font-semibold text-green-700">{formatPrice(booking.advancePaid)}</p>
                            </div>
                            {booking.status !== "COMPLETED" && balance != null && balance > 0 && (
                              <div>
                                <p className="text-xs text-orange-500">⚠️ Balance at Check-in</p>
                                <p className="font-semibold text-orange-600">{formatPrice(balance)}</p>
                              </div>
                            )}
                          </>
                        )}
                        {booking.paymentId && (
                          <p className="text-[10px] text-gray-400 font-mono break-all">
                            {booking.paymentId.slice(0, 20)}…
                          </p>
                        )}

                        {/* Print button — only for CONFIRMED bookings */}
                        {booking.status === "CONFIRMED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printBooking(booking, session?.user?.email)}
                            className="mt-2 w-full sm:w-auto gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print Booking
                          </Button>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Showing latest 10 bookings · For older history contact{" "}
          <a href="mailto:leroxstay@gmail.com" className="underline hover:text-blue-600">
            leroxstay@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

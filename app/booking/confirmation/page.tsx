"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle,
  Calendar,
  Users,
  CreditCard,
  Download,
  Home,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface ConfirmedBooking {
  bookingId: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentId: string;
  guestName: string;
  guestEmail: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<ConfirmedBooking | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("confirmedBooking");
    if (!data) {
      router.push("/");
      return;
    }
    setBooking(JSON.parse(data));
  }, []);

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500">
            Your reservation has been successfully made. A confirmation email has
            been sent to{" "}
            <span className="font-medium text-gray-700">{booking.guestEmail}</span>
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            {/* Booking ID */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm text-gray-500">Booking Reference</p>
                <p className="text-xl font-bold text-blue-600 font-mono">
                  #{booking.bookingId.slice(-8).toUpperCase()}
                </p>
              </div>
              <Badge variant="success" className="text-sm">
                Confirmed
              </Badge>
            </div>

            <Separator className="mb-5" />

            {/* Room Details */}
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {booking.roomName}
              </h2>
              <p className="text-sm text-gray-500">
                {booking.nights} night{booking.nights !== 1 ? "s" : ""} stay
              </p>
            </div>

            {/* Stay Details */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-medium mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Check-in
                </div>
                <p className="font-semibold text-gray-900">
                  {format(new Date(booking.checkIn), "EEE, MMM dd")}
                </p>
                <p className="text-sm text-gray-500">After 2:00 PM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-medium mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Check-out
                </div>
                <p className="font-semibold text-gray-900">
                  {format(new Date(booking.checkOut), "EEE, MMM dd")}
                </p>
                <p className="text-sm text-gray-500">Before 12:00 PM</p>
              </div>
            </div>

            {/* Guest Info */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{booking.guestEmail}</span>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Payment Info */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Booking Amount</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(booking.totalPrice)}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-blue-200 text-sm">
                <div className="bg-green-600 text-white px-4 py-2 font-semibold text-xs uppercase tracking-wide">
                  Payment Summary
                </div>
                <div className="divide-y divide-blue-100">
                  <div className="flex justify-between items-center px-4 py-3 bg-green-50">
                    <div>
                      <p className="font-semibold text-green-800">✅ Advance Paid (50%)</p>
                      <p className="text-xs text-green-600">Paid online via Razorpay</p>
                    </div>
                    <span className="font-bold text-green-700 text-base">
                      {formatPrice(booking.advanceAmount ?? booking.totalPrice * 0.5)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-yellow-50">
                    <div>
                      <p className="font-semibold text-yellow-800">⚠️ Balance Due at Check-in (50%)</p>
                      <p className="text-xs text-yellow-600">Cash / UPI at property</p>
                    </div>
                    <span className="font-bold text-yellow-700 text-base">
                      {formatPrice(booking.balanceAmount ?? booking.totalPrice * 0.5)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 pt-1">
                <CreditCard className="h-4 w-4" />
                <span>Payment ID: </span>
                <span className="font-mono text-gray-700">
                  {booking.paymentId}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>
                  A confirmation email with all booking details has been sent to
                  your email
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>
                  Present your booking ID at check-in: #{booking.bookingId.slice(-8).toUpperCase()}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>
                  Balance amount of <strong>{formatPrice(booking.balanceAmount ?? booking.totalPrice * 0.5)}</strong> is payable at the property via Cash or UPI
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>
                  Contact us at +91 93422 22799 or leroxstay@gmail.com for any assistance
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-4 w-4" />
            Print Confirmation
          </Button>
        </div>
      </div>
    </div>
  );
}

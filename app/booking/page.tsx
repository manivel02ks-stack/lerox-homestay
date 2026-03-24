"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Users, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";

interface PendingBooking {
  roomId: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
}

export default function BookingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    const data = sessionStorage.getItem("pendingBooking");
    if (!data) {
      router.push("/rooms");
      return;
    }
    setPendingBooking(JSON.parse(data));
    if (session?.user?.name) {
      setGuestName(session.user.name);
    }
  }, [status, session]);

  const handlePayment = async () => {
    if (!pendingBooking) return;
    if (!guestName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!guestPhone.trim()) {
      toast({ title: "Please enter your phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Create booking first
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: pendingBooking.roomId,
          checkIn: pendingBooking.checkIn,
          checkOut: pendingBooking.checkOut,
          guests: pendingBooking.guests,
          totalPrice: pendingBooking.totalPrice,
          guestName,
          guestEmail: session?.user?.email,
          guestPhone,
          specialRequests,
        }),
      });

      if (!bookingRes.ok) {
        const error = await bookingRes.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const bookingData = await bookingRes.json();

      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
          amount: pendingBooking.totalPrice,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Load Razorpay
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "Le Rox Home-Stay",
          description: `50% Advance – ${pendingBooking.roomName} | Balance ₹${orderData.balanceAmount} due at Check-in`,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: bookingData.booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              sessionStorage.removeItem("pendingBooking");
              sessionStorage.setItem(
                "confirmedBooking",
                JSON.stringify({
                  ...pendingBooking,
                  bookingId: bookingData.booking.id,
                  paymentId: response.razorpay_payment_id,
                  advanceAmount: orderData.advanceAmount,
                  balanceAmount: orderData.balanceAmount,
                  guestName,
                  guestEmail: session?.user?.email,
                })
              );
              router.push("/booking/confirmation");
            } else {
              toast({
                title: "Payment verification failed",
                description: "Please contact support",
                variant: "destructive",
              });
            }
          },
          prefill: {
            name: guestName,
            email: session?.user?.email || "",
            contact: guestPhone,
          },
          theme: { color: "#2563eb" },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      };
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!pendingBooking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Complete Your Booking
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guest Details Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email || ""}
                    readOnly
                    className="mt-1.5 bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="requests">Special Requests (Optional)</Label>
                  <Textarea
                    id="requests"
                    placeholder="Any special requests or preferences..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="mt-1.5 resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Cancellation Policy
                </h3>
                <p className="text-sm text-blue-700">
                  Free cancellation up to 24 hours before check-in. After that, a
                  one-night fee applies.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24 shadow-sm">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Room Info */}
                <div className="flex gap-4">
                  <div className="relative h-20 w-28 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        pendingBooking.roomImage ||
                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400"
                      }
                      alt={pendingBooking.roomName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {pendingBooking.roomName}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {pendingBooking.nights} night{pendingBooking.nights !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Booking Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Check-in: </span>
                      <span className="font-medium">
                        {format(new Date(pendingBooking.checkIn), "EEE, MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Check-out: </span>
                      <span className="font-medium">
                        {format(new Date(pendingBooking.checkOut), "EEE, MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Guests: </span>
                      <span className="font-medium">
                        {pendingBooking.guests} guest{pendingBooking.guests !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {formatPrice(pendingBooking.pricePerNight)} × {pendingBooking.nights} night{pendingBooking.nights !== 1 ? "s" : ""}
                    </span>
                    <span>{formatPrice(pendingBooking.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Taxes & fees</span>
                    <span className="text-green-600">Included</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-gray-900">{formatPrice(pendingBooking.totalPrice)}</span>
                </div>

                {/* 50% Payment Split */}
                <div className="rounded-xl overflow-hidden border border-blue-200 text-sm">
                  <div className="bg-blue-600 text-white px-4 py-2 font-semibold text-xs uppercase tracking-wide">
                    Payment Schedule
                  </div>
                  <div className="divide-y divide-blue-100">
                    <div className="flex justify-between items-center px-4 py-3 bg-blue-50">
                      <div>
                        <p className="font-semibold text-blue-800">Pay Now (50% Advance)</p>
                        <p className="text-xs text-blue-500">Paid online via Razorpay</p>
                      </div>
                      <span className="font-bold text-blue-700 text-base">
                        {formatPrice(pendingBooking.totalPrice * 0.5)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-700">Pay at Check-in (50%)</p>
                        <p className="text-xs text-gray-400">Cash / UPI at property</p>
                      </div>
                      <span className="font-bold text-gray-600 text-base">
                        {formatPrice(pendingBooking.totalPrice * 0.5)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Advance {formatPrice(pendingBooking.totalPrice * 0.5)}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>Secured by Razorpay</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

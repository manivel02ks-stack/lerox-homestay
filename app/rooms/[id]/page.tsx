"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Users,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingCalendar } from "@/components/BookingCalendar";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  amenities: string[];
  maxGuests: number;
  isActive: boolean;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState("1");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  async function fetchRoom() {
    try {
      const res = await fetch(`/api/rooms/${params.id}`);
      if (!res.ok) {
        router.push("/rooms");
        return;
      }
      const data = await res.json();
      setRoom(data.room);
    } catch (error) {
      router.push("/rooms");
    } finally {
      setLoading(false);
    }
  }

  const nights =
    selectedRange?.from && selectedRange?.to
      ? differenceInDays(selectedRange.to, selectedRange.from)
      : 0;

  const totalPrice = room ? nights * room.price : 0;

  const handleBooking = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      toast({ title: "Please select check-in and check-out dates", variant: "destructive" });
      return;
    }

    if (nights <= 0) {
      toast({ title: "Check-out must be after check-in", variant: "destructive" });
      return;
    }

    setBookingLoading(true);
    try {
      // Store booking details in session storage and navigate to booking page
      const bookingData = {
        roomId: room!.id,
        roomName: room!.name,
        roomImage: room!.images[0],
        checkIn: selectedRange.from.toISOString(),
        checkOut: selectedRange.to.toISOString(),
        guests: Number(guests),
        nights,
        pricePerNight: room!.price,
        totalPrice,
      };

      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));

      if (!session) {
        // Save booking then redirect to login with callbackUrl so user lands on /booking after sign-in
        router.push("/auth/login?callbackUrl=/booking");
      } else {
        router.push("/booking");
      }
    } catch (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setBookingLoading(false);
    }
  };

  const images = room?.images?.length ? room.images : ["/images/exterior/img_00.jpg"];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Button>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 mb-8">
        <div className="relative h-72 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={room.name}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    (prev) => (prev - 1 + images.length) % images.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) => (prev + 1) % images.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === currentImageIndex
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={img}
                  alt={`${room.name} ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Basic Info */}
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                <div className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Up to {room.maxGuests} guests</span>
                </div>
                {!room.isActive && (
                  <Badge variant="destructive">Currently Unavailable</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About this room</h2>
              <p className="text-gray-600 leading-relaxed">{room.description}</p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Calendar */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Your Dates</h2>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <BookingCalendar
                  roomId={room.id}
                  onDateSelect={setSelectedRange}
                  selectedRange={selectedRange}
                />
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-0">
              <CardHeader className="border-b">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(room.price)}
                  </span>
                  <span className="text-gray-400 text-sm">/night</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 • 200+ reviews</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Date Selection Summary */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  {selectedRange?.from ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">
                          Check-in
                        </p>
                        <p className="font-semibold text-gray-900">
                          {format(selectedRange.from, "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">
                          Check-out
                        </p>
                        <p className="font-semibold text-gray-900">
                          {selectedRange.to
                            ? format(selectedRange.to, "MMM dd, yyyy")
                            : "Select date"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-1">
                      Select dates from the calendar
                    </p>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <Label className="text-sm font-medium">Number of Guests</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: room.maxGuests }).map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1} Guest{i + 1 !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {formatPrice(room.price)} × {nights} night{nights !== 1 ? "s" : ""}
                      </span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Taxes & fees (included)</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  onClick={handleBooking}
                  disabled={
                    !room.isActive ||
                    bookingLoading ||
                    !selectedRange?.from ||
                    !selectedRange?.to ||
                    nights <= 0
                  }
                >
                  {bookingLoading
                    ? "Processing..."
                    : !room.isActive
                    ? "Room Unavailable"
                    : nights > 0
                    ? `Book for ${formatPrice(totalPrice)}`
                    : "Select Dates to Book"}
                </Button>

                <p className="text-xs text-center text-gray-400">
                  Free cancellation up to 24 hours before check-in
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

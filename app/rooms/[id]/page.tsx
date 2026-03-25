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

interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  adminReply: string | null;
  adminRepliedAt: string | null;
  createdAt: string;
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
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  async function fetchRoom() {
    try {
      const [roomRes, reviewsRes] = await Promise.all([
        fetch(`/api/rooms/${params.id}`),
        fetch(`/api/rooms/${params.id}/reviews`),
      ]);
      if (!roomRes.ok) { router.push("/rooms"); return; }
      const roomData    = await roomRes.json();
      const reviewsData = await reviewsRes.json();
      setRoom(roomData.room);
      setReviews(reviewsData.reviews || []);
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
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{(reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)}</span>
                  </div>
                )}
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

            <Separator />

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Guest Reviews
                  {reviews.length > 0 && (
                    <span className="ml-2 text-base font-normal text-gray-500">({reviews.length})</span>
                  )}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm py-4">No reviews yet — be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm text-gray-900">{review.guestName}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">
                          {format(new Date(review.createdAt), "dd MMM yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      {review.adminReply && (
                        <div className="mt-3 ml-4 border-l-2 border-blue-300 pl-3 py-1 bg-blue-50 rounded-r-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-1">
                            Response from Le Rox Home-Stay
                            {review.adminRepliedAt && (
                              <span className="font-normal text-blue-400 ml-1">
                                · {format(new Date(review.adminRepliedAt), "dd MMM yyyy")}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-blue-800">{review.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                  {reviews.length > 0
                    ? <span>{(reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                    : <span>No reviews yet</span>
                  }
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

import Link from "next/link";
import { Search, Shield, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomCard } from "@/components/RoomCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { prisma } from "@/lib/prisma";

async function getFeaturedRooms() {
  try {
    return await prisma.room.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const rooms = await getFeaturedRooms();

  return (
    <div className="flex flex-col min-h-screen">
      <HeroCarousel />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Booking",
                description:
                  "Your payments are protected with bank-level security via Razorpay.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Clock,
                title: "Flexible Check-in",
                description:
                  "Easy check-in from 2 PM. Early check-in available upon request.",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Award,
                title: "Premium Service",
                description:
                  "24/7 concierge service to make your stay exceptional.",
                color: "bg-purple-100 text-purple-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start space-x-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div
                  className={`flex-shrink-0 p-3 rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Featured Rooms
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose from our selection of thoughtfully designed rooms, each
              offering a unique blend of comfort and elegance.
            </p>
          </div>

          {rooms.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Link href="/rooms">View All Rooms</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No rooms available yet
              </h3>
              <p className="text-gray-500 mb-6">
                Rooms will appear here once added by the admin.
              </p>
              <Button asChild>
                <Link href="/auth/login">Admin Login</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready for an Unforgettable Stay?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
            Book your room today and receive exclusive benefits including
            complimentary breakfast and late checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/rooms">Explore Rooms</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

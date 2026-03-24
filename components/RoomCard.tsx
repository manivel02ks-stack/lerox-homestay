import Link from "next/link";
import Image from "next/image";
import { Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    amenities: string[];
    maxGuests: number;
    isActive: boolean;
  };
}

export function RoomCard({ room }: RoomCardProps) {
  const displayImage = room.images[0] || "/images/exterior/img_00.jpg";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={displayImage}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white/90 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            4.8
          </Badge>
        </div>
        {!room.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Not Available
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {room.name}
          </h3>
          <div className="flex items-center text-sm text-gray-500 ml-2 shrink-0">
            <Users className="h-4 w-4 mr-1" />
            <span>{room.maxGuests}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {room.amenities.slice(0, 3).map((amenity) => (
            <Badge
              key={amenity}
              variant="secondary"
              className="text-xs font-normal"
            >
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{room.amenities.length - 3} more
            </Badge>
          )}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(room.price)}
              </span>
              <span className="text-sm text-gray-400">/night</span>
            </div>
          </div>
          <Button
            asChild
            disabled={!room.isActive}
            className="group/btn bg-blue-600 hover:bg-blue-700"
          >
            <Link href={`/rooms/${room.id}`}>
              Book Now
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

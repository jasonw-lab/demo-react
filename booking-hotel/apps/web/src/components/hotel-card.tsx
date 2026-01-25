"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import type { Hotel } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HotelCardProps = {
  hotel: Hotel;
};

export function HotelCard({ hotel }: HotelCardProps) {
  const visibleAmenities = hotel.amenities.slice(0, 3);
  const remainingAmenities = Math.max(0, hotel.amenities.length - visibleAmenities.length);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg motion-reduce:transition-none">
      <div className="relative h-44">
        <Image
          src={hotel.images[0] ?? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </div>

      <CardHeader className="space-y-2">
        <CardTitle className="text-base leading-tight">{hotel.name}</CardTitle>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-4 fill-primary text-primary" />
            <span className="font-medium text-foreground">{hotel.rating.toFixed(1)}</span>
            <span className="text-xs">({hotel.reviewCount.toLocaleString()})</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs">
            <MapPin className="size-3.5" />
            <span className="line-clamp-1">{hotel.address}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{hotel.shortDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">from ${hotel.pricePerNight}/night</Badge>
          {visibleAmenities.map((a) => (
            <Badge key={a} variant="outline">
              {a}
            </Badge>
          ))}
          {remainingAmenities > 0 ? (
            <Badge variant="outline">+{remainingAmenities}</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}


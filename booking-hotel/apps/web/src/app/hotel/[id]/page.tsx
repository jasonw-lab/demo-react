import { notFound } from "next/navigation";

import type { SearchParams } from "@/types";
import { getHotelById } from "@/lib/data";
import { HotelDetail } from "@/components/hotel/hotel-detail";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined, fallback: number) {
  const n = value ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export default async function HotelPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const hotel = getHotelById(id);
  if (!hotel) notFound();

  const search: SearchParams = {
    destinationId: first(query.destinationId),
    checkIn: first(query.checkIn),
    checkOut: first(query.checkOut),
    adults: toNumber(first(query.adults), 2),
    children: toNumber(first(query.children), 0),
    rooms: toNumber(first(query.rooms), 1),
  };

  return <HotelDetail hotel={hotel} search={search} />;
}


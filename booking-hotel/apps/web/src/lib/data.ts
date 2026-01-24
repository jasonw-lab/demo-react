import { destinations } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import type { Destination, Hotel } from "@/types";

export const getDestinations = (): Destination[] => destinations;

export const getPopularDestinations = (limit = 6): Destination[] =>
  destinations.filter((d) => d.isPopular).slice(0, limit);

export const getHotels = (): Hotel[] => hotels;

export const getHotelsByDestination = (destinationId: string): Hotel[] =>
  hotels.filter((h) => h.destinationId === destinationId);

export const getHotelById = (hotelId: string): Hotel | undefined =>
  hotels.find((h) => h.id === hotelId);


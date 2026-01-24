export type Destination = {
  id: string;
  name: string;
  country: string;
  region?: string;
  description: string;
  imageUrl: string;
  isPopular?: boolean;
};

export type RoomType = {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
};

export type Hotel = {
  id: string;
  destinationId: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  shortDescription: string;
  description: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  roomTypes: RoomType[];
};

export type SearchParams = {
  destinationId?: string;
  checkIn?: string; // yyyy-mm-dd
  checkOut?: string; // yyyy-mm-dd
  adults?: number;
  children?: number;
  rooms?: number;
};

export type FilterParams = {
  minPrice?: number;
  maxPrice?: number;
  ratings?: number[];
  amenities?: string[];
  sort?: "recommended" | "price_asc" | "price_desc" | "rating_desc";
};

export type BookingInfo = {
  hotelId: string;
  roomTypeId: string;
  checkIn: string; // yyyy-mm-dd
  checkOut: string; // yyyy-mm-dd
  adults: number;
  children: number;
  rooms: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialRequests?: string;
};


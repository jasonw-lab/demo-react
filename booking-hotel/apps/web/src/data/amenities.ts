export const amenities = [
  "Free Wi‑Fi",
  "Breakfast included",
  "Airport shuttle",
  "Pool",
  "Spa",
  "Gym",
  "Restaurant",
  "Bar",
  "Room service",
  "24h front desk",
  "Laundry",
  "Parking",
  "Family rooms",
  "Non-smoking",
  "Pet friendly",
  "Ocean view",
  "City view",
  "Onsen",
  "Workspace",
] as const;

export type Amenity = (typeof amenities)[number];


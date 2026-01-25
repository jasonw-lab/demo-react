import { HotelCardSkeleton } from "@/components/skeletons/hotel-card-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="grid gap-2">
        <div className="h-7 w-28 rounded-md bg-muted" />
        <div className="h-4 w-96 max-w-full rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <HotelCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

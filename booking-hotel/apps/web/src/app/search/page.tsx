"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { amenities as allAmenities } from "@/data/amenities";
import type { FilterParams, Hotel, SearchParams } from "@/types";
import { getDestinations, getHotelsByDestination } from "@/lib/data";
import { cn } from "@/lib/utils";
import { HotelCard } from "@/components/hotel-card";
import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ratingOptions = [
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
  { value: 3.5, label: "3.5+" },
] as const;

const sortOptions = [
  { value: "recommended", label: "おすすめ順" },
  { value: "price_asc", label: "価格が安い順" },
  { value: "price_desc", label: "価格が高い順" },
  { value: "rating_desc", label: "評価が高い順" },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: string | null | undefined, fallback: number) {
  const n = value ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseYmd(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function scoreRecommended(hotel: Hotel) {
  return hotel.rating * 1000 + Math.log10(hotel.reviewCount + 1) * 150;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destinationId = searchParams.get("destinationId") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const adults = toNumber(searchParams.get("adults"), 2);
  const children = toNumber(searchParams.get("children"), 0);
  const rooms = toNumber(searchParams.get("rooms"), 1);

  const destination = React.useMemo(
    () => getDestinations().find((d) => d.id === destinationId),
    [destinationId],
  );

  const hotels = React.useMemo(() => {
    if (!destinationId) return [];
    return getHotelsByDestination(destinationId);
  }, [destinationId]);

  const priceBounds = React.useMemo(() => {
    const prices = hotels.map((h) => h.pricePerNight);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 500;
    return [min, max] as const;
  }, [hotels]);

  const [minBound, maxBound] = priceBounds;

  const [priceRange, setPriceRange] = React.useState<[number, number]>([minBound, maxBound]);
  const [ratings, setRatings] = React.useState<number[]>([]);
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<FilterParams["sort"]>("recommended");

  const hotelQuery = React.useMemo(() => {
    const params = new URLSearchParams();
    if (destinationId) params.set("destinationId", destinationId);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("adults", String(adults));
    params.set("children", String(children));
    params.set("rooms", String(rooms));
    return params.toString();
  }, [adults, checkIn, checkOut, children, destinationId, rooms]);

  React.useEffect(() => {
    const urlMin = clamp(toNumber(searchParams.get("minPrice"), minBound), minBound, maxBound);
    const urlMax = clamp(toNumber(searchParams.get("maxPrice"), maxBound), minBound, maxBound);

    const nextMin = Math.min(urlMin, urlMax);
    const nextMax = Math.max(urlMin, urlMax);

    const urlRatings = parseCsv(searchParams.get("ratings"))
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n));

    const urlAmenities = parseCsv(searchParams.get("amenities")).filter((a) =>
      (allAmenities as readonly string[]).includes(a),
    );

    const urlSort = (searchParams.get("sort") ?? "recommended") as FilterParams["sort"];
    const normalizedSort = sortOptions.some((o) => o.value === urlSort) ? urlSort : "recommended";

    setPriceRange([nextMin, nextMax]);
    setRatings(urlRatings);
    setAmenities(urlAmenities);
    setSort(normalizedSort);
  }, [maxBound, minBound, searchParams]);

  const updateUrl = React.useCallback(
    (next: Partial<FilterParams>, options?: { scroll?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      const nextSort = next.sort ?? sort;
      if (!nextSort || nextSort === "recommended") params.delete("sort");
      else params.set("sort", nextSort);

      const nextMinPrice = next.minPrice ?? priceRange[0];
      const nextMaxPrice = next.maxPrice ?? priceRange[1];
      if (nextMinPrice === minBound && nextMaxPrice === maxBound) {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        params.set("minPrice", String(nextMinPrice));
        params.set("maxPrice", String(nextMaxPrice));
      }

      const nextRatings = next.ratings ?? ratings;
      if (!nextRatings?.length) params.delete("ratings");
      else params.set("ratings", nextRatings.join(","));

      const nextAmenities = next.amenities ?? amenities;
      if (!nextAmenities?.length) params.delete("amenities");
      else params.set("amenities", nextAmenities.join(","));

      const query = params.toString();
      router.replace(query ? `/search?${query}` : "/search", { scroll: options?.scroll ?? false });
    },
    [amenities, maxBound, minBound, priceRange, ratings, router, searchParams, sort],
  );

  const filteredHotels = React.useMemo(() => {
    if (!destination) return [];

    const minRating = ratings.length ? Math.min(...ratings) : undefined;

    const result = hotels.filter((hotel) => {
      if (hotel.pricePerNight < priceRange[0] || hotel.pricePerNight > priceRange[1]) return false;
      if (typeof minRating === "number" && hotel.rating < minRating) return false;
      if (amenities.length && !amenities.every((a) => hotel.amenities.includes(a))) return false;
      return true;
    });

    switch (sort) {
      case "price_asc":
        return [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
      case "price_desc":
        return [...result].sort((a, b) => b.pricePerNight - a.pricePerNight);
      case "rating_desc":
        return [...result].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case "recommended":
      default:
        return [...result].sort((a, b) => scoreRecommended(b) - scoreRecommended(a));
    }
  }, [amenities, destination, hotels, priceRange, ratings, sort]);

  const searchDefaults: Partial<SearchParams> = React.useMemo(
    () => ({
      destinationId: destinationId || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      adults,
      children,
      rooms,
    }),
    [adults, checkIn, checkOut, children, destinationId, rooms],
  );

  const searchFormInitialValues = React.useMemo(() => {
    return {
      destinationId: searchDefaults.destinationId ?? "",
      dateRange: {
        from: parseYmd(searchDefaults.checkIn),
        to: parseYmd(searchDefaults.checkOut),
      },
      adults: searchDefaults.adults ?? 2,
      children: searchDefaults.children ?? 0,
      rooms: searchDefaults.rooms ?? 1,
    };
  }, [searchDefaults]);

  const resetFilters = React.useCallback(() => {
    setPriceRange([minBound, maxBound]);
    setRatings([]);
    setAmenities([]);
    setSort("recommended");
    updateUrl({ minPrice: minBound, maxPrice: maxBound, ratings: [], amenities: [], sort: "recommended" });
  }, [maxBound, minBound, updateUrl]);

  const FilterPanel = (
    <div className="grid gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">価格帯</h3>
          <span className="text-xs text-muted-foreground">
            ${priceRange[0]} – ${priceRange[1]}
          </span>
        </div>
        <Slider
          min={minBound}
          max={maxBound}
          step={10}
          value={priceRange}
          onValueChange={(value) => {
            const [a, b] = value as number[];
            const next: [number, number] = [clamp(a, minBound, maxBound), clamp(b, minBound, maxBound)];
            setPriceRange([Math.min(...next), Math.max(...next)]);
          }}
          onValueCommit={(value) => {
            const [a, b] = value as number[];
            const next: [number, number] = [clamp(a, minBound, maxBound), clamp(b, minBound, maxBound)];
            updateUrl({ minPrice: Math.min(...next), maxPrice: Math.max(...next) });
          }}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">評価</h3>
        <div className="grid gap-2">
          {ratingOptions.map((opt) => {
            const checked = ratings.includes(opt.value);
            return (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    const next = v ? [...ratings, opt.value] : ratings.filter((r) => r !== opt.value);
                    setRatings(next);
                    updateUrl({ ratings: next });
                  }}
                />
                <span className="text-muted-foreground">★</span>
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">設備</h3>
        <div className="max-h-64 space-y-2 overflow-auto pr-2">
          {allAmenities.map((a) => {
            const checked = amenities.includes(a);
            return (
              <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    const next = v ? [...amenities, a] : amenities.filter((x) => x !== a);
                    setAmenities(next);
                    updateUrl({ amenities: next });
                  }}
                />
                <span className="text-muted-foreground">{a}</span>
              </label>
            );
          })}
        </div>
      </div>

      <Button variant="outline" onClick={resetFilters} className="w-full">
        フィルタをリセット
      </Button>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">検索条件を調整しながら、ホテルを絞り込みできます。</p>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">検索条件</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  条件を編集
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>検索条件を編集</DialogTitle>
                </DialogHeader>
                <SearchForm initialValues={searchFormInitialValues} variant="plain" />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{destination?.name ?? "未選択"}</Badge>
            {checkIn && checkOut ? (
              <Badge variant="secondary">
                {checkIn} → {checkOut}
              </Badge>
            ) : (
              <Badge variant="secondary">日付未指定</Badge>
            )}
            <Badge variant="secondary">
              大人 {adults} / 子供 {children} / 部屋 {rooms}
            </Badge>
          </div>
          <Separator />
          <p className="text-muted-foreground">フィルタ/並び替えはURLに同期し、ブラウザバックでも状態が保持されます。</p>
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">フィルタ</CardTitle>
            </CardHeader>
            <CardContent>{FilterPanel}</CardContent>
          </Card>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">Hotels</h2>
              <p className="text-sm text-muted-foreground">
                {destination ? `${filteredHotels.length} 件（全 ${hotels.length} 件）` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="mr-2 size-4" />
                    フィルタ
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>フィルタ</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-4">{FilterPanel}</div>
                </SheetContent>
              </Sheet>

              <Select
                value={sort}
                onValueChange={(value) => {
                  const next = value as FilterParams["sort"];
                  setSort(next);
                  updateUrl({ sort: next });
                }}
              >
                <SelectTrigger className={cn("w-[160px]")}>
                  <SelectValue placeholder="並び替え" />
                </SelectTrigger>
                <SelectContent align="end">
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!destination ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                目的地を選択して検索してください。
              </CardContent>
            </Card>
          ) : filteredHotels.length === 0 ? (
            <Card>
              <CardContent className="grid gap-3 py-10 text-center text-sm text-muted-foreground">
                <p>条件に合うホテルが見つかりませんでした。</p>
                <div>
                  <Button variant="outline" onClick={resetFilters}>
                    条件をリセット
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  href={hotelQuery ? `/hotel/${hotel.id}?${hotelQuery}` : `/hotel/${hotel.id}`}
                  className="block"
                >
                  <HotelCard hotel={hotel} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

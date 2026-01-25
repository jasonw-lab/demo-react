"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarDays, Check, MapPin, Star, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { BookingInfo, Hotel, RoomType, SearchParams } from "@/types";
import { cn } from "@/lib/utils";
import { useBooking } from "@/components/booking/booking-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type HotelDetailProps = {
  hotel: Hotel;
  search: SearchParams;
};

const bookingSchema = z.object({
  firstName: z.string().min(1, "必須です"),
  lastName: z.string().min(1, "必須です"),
  email: z.string().email("メール形式で入力してください"),
  phone: z.string().optional(),
  specialRequests: z.string().max(500, "500文字以内で入力してください").optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function parseYmd(value: string | undefined) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function formatStay(search: SearchParams) {
  const from = parseYmd(search.checkIn);
  const to = parseYmd(search.checkOut);
  if (!from || !to) return undefined;
  return `${format(from, "MMM d")} – ${format(to, "MMM d")}`;
}

function calcNights(search: SearchParams) {
  const from = parseYmd(search.checkIn);
  const to = parseYmd(search.checkOut);
  if (!from || !to) return 1;
  return Math.max(1, differenceInCalendarDays(to, from));
}

function sumGuests(search: SearchParams) {
  return (search.adults ?? 0) + (search.children ?? 0);
}

function PriceLine({
  selectedRoom,
  nights,
  rooms,
}: {
  selectedRoom: RoomType | undefined;
  nights: number;
  rooms: number;
}) {
  if (!selectedRoom) return null;
  const total = selectedRoom.pricePerNight * nights * rooms;
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground">
          ${selectedRoom.pricePerNight}/night × {nights} nights × {rooms} rooms
        </span>
        <span className="font-semibold">${total}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Taxes and fees are not included (demo).
      </div>
    </div>
  );
}

function BookingPanel({
  hotel,
  selectedRoom,
  search,
  onBooked,
}: {
  hotel: Hotel;
  selectedRoom: RoomType | undefined;
  search: SearchParams;
  onBooked: () => void;
}) {
  const router = useRouter();
  const { setBooking } = useBooking();
  const [isPending, startTransition] = React.useTransition();

  const nights = calcNights(search);
  const rooms = search.rooms ?? 1;

  const stayLabel = formatStay(search);
  const guestCount = sumGuests(search);

  const canBook = Boolean(selectedRoom && search.checkIn && search.checkOut);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialRequests: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (values: BookingFormValues) => {
    if (!selectedRoom) return;
    if (!search.checkIn || !search.checkOut) return;

    const booking: BookingInfo = {
      hotelId: hotel.id,
      roomTypeId: selectedRoom.id,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adults: search.adults ?? 2,
      children: search.children ?? 0,
      rooms: search.rooms ?? 1,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      specialRequests: values.specialRequests || undefined,
    };

    startTransition(() => {
      setBooking(booking);
      onBooked();
      router.push("/booking/confirmation");
    });
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Booking summary</p>
            <p className="text-xs text-muted-foreground">{hotel.name}</p>
          </div>
          {selectedRoom ? (
            <Badge variant="secondary">{selectedRoom.name}</Badge>
          ) : (
            <Badge variant="outline">部屋を選択</Badge>
          )}
        </div>
        <Separator />
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              Stay
            </span>
            <span className="font-medium">{stayLabel ?? "検索条件から選択"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              Guests
            </span>
            <span className="font-medium">
              {guestCount} guests · {rooms} rooms
            </span>
          </div>
        </div>
        <Separator />
        <PriceLine selectedRoom={selectedRoom} nights={nights} rooms={rooms} />
      </div>

      {!canBook ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          検索条件（宿泊日）と部屋タイプを選択してください。
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メール</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>電話番号（任意）</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>特記事項（任意）</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={!canBook || isPending} className="w-full">
            {isPending ? "処理中..." : "予約を確定（モック）"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export function HotelDetail({ hotel, search }: HotelDetailProps) {
  const [roomTypeId, setRoomTypeId] = React.useState(hotel.roomTypes[0]?.id ?? "");
  const selectedRoom = React.useMemo(
    () => hotel.roomTypes.find((r) => r.id === roomTypeId),
    [hotel.roomTypes, roomTypeId],
  );

  const images = React.useMemo(() => {
    return uniqueStrings([
      ...hotel.images,
      ...hotel.roomTypes.flatMap((r) => r.images),
    ]).filter(Boolean);
  }, [hotel.images, hotel.roomTypes]);

  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | undefined>(undefined);

  const stayLabel = formatStay(search);
  const nights = calcNights(search);
  const guests = sumGuests(search);
  const rooms = search.rooms ?? 1;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const baseSearchParams = React.useMemo(() => {
    const params = new URLSearchParams();
    if (search.destinationId) params.set("destinationId", search.destinationId);
    if (search.checkIn) params.set("checkIn", search.checkIn);
    if (search.checkOut) params.set("checkOut", search.checkOut);
    if (search.adults != null) params.set("adults", String(search.adults));
    if (search.children != null) params.set("children", String(search.children));
    if (search.rooms != null) params.set("rooms", String(search.rooms));
    return params.toString();
  }, [search.adults, search.checkIn, search.checkOut, search.children, search.destinationId, search.rooms]);

  const backHref = baseSearchParams ? `/search?${baseSearchParams}` : "/search";

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 pb-24 md:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>← Search results</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {stayLabel ? <Badge variant="outline">{stayLabel}</Badge> : null}
          <Badge variant="outline">
            {guests} guests · {rooms} rooms · {nights} nights
          </Badge>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{hotel.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-4 fill-primary text-primary" />
                      <span className="font-medium text-foreground">{hotel.rating.toFixed(1)}</span>
                      <span className="text-xs">({hotel.reviewCount.toLocaleString()})</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      <span>{hotel.address}</span>
                    </span>
                  </div>
                </div>

                <Carousel setApi={setCarouselApi} className="relative">
                  <CarouselContent>
                    {images.map((src) => (
                      <CarouselItem key={src}>
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border">
                          <Image
                            src={src}
                            alt={hotel.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 800px"
                            priority
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-3 top-1/2 translate-y-[-50%]" />
                  <CarouselNext className="right-3 top-1/2 translate-y-[-50%]" />
                </Carousel>

                <div className="flex flex-wrap gap-2">
                  {images.slice(0, 5).map((src, idx) => (
                    <button
                      type="button"
                      key={src}
                      className="relative h-16 w-24 overflow-hidden rounded-lg border transition hover:opacity-90"
                      onClick={() => carouselApi?.scrollTo(idx)}
                    >
                      <Image src={src} alt="" fill className="object-cover" sizes="96px" />
                    </button>
                  ))}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View all photos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                      <DialogHeader>
                        <DialogTitle>{hotel.name}</DialogTitle>
                      </DialogHeader>
                      <Carousel className="relative">
                        <CarouselContent>
                          {images.map((src) => (
                            <CarouselItem key={src}>
                              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border">
                                <Image
                                  src={src}
                                  alt={hotel.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 1024px) 100vw, 900px"
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-3 top-1/2 translate-y-[-50%]" />
                        <CarouselNext className="right-3 top-1/2 translate-y-[-50%]" />
                      </Carousel>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hotel info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">概要</TabsTrigger>
                  <TabsTrigger value="rooms">部屋タイプ</TabsTrigger>
                  <TabsTrigger value="amenities">設備</TabsTrigger>
                  <TabsTrigger value="reviews">レビュー</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 grid gap-4">
                  <p className="text-sm text-muted-foreground">{hotel.description}</p>
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Popular amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((a) => (
                        <Badge key={a} variant="outline">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">Map (demo)</p>
                      <Badge variant="secondary">{hotel.address}</Badge>
                    </div>
                    <div className="mt-4 grid place-items-center rounded-lg border bg-background/50 py-10 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4" />
                        Pseudo map preview
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rooms" className="mt-4 grid gap-4">
                  <RadioGroup value={roomTypeId} onValueChange={setRoomTypeId} className="grid gap-3">
                    {hotel.roomTypes.map((room) => (
                      <label
                        key={room.id}
                        className={cn(
                          "grid gap-4 rounded-xl border p-4 transition hover:bg-muted/20",
                          roomTypeId === room.id && "border-primary bg-primary/5",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={room.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold">{room.name}</p>
                                <p className="text-sm text-muted-foreground">{room.description}</p>
                              </div>
                              <Badge variant="secondary">${room.pricePerNight}/night</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Users className="size-3.5" />
                                Max {room.maxGuests}
                              </span>
                              <span>·</span>
                              <span>{room.amenities.slice(0, 3).join(", ")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative aspect-[16/7] overflow-hidden rounded-lg border">
                          <Image
                            src={room.images[0] ?? hotel.images[0] ?? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"}
                            alt={room.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 800px"
                          />
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </TabsContent>

                <TabsContent value="amenities" className="mt-4 grid gap-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {hotel.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                        <Check className="size-4 text-primary" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4 grid gap-3">
                  {[
                    {
                      name: "Aiko",
                      title: "Perfect location",
                      body: "Friendly staff and clean rooms. Great access to transit and restaurants.",
                    },
                    {
                      name: "Ken",
                      title: "Comfortable stay",
                      body: "The room was quiet and the bed was excellent. Would book again.",
                    },
                    {
                      name: "Mina",
                      title: "Loved the amenities",
                      body: "Gym was small but well kept. Breakfast selection was solid for the price.",
                    },
                  ].map((r) => (
                    <div key={r.name} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">{r.name}</p>
                          <p className="text-sm text-muted-foreground">{r.title}</p>
                        </div>
                        <Badge variant="secondary">{hotel.rating.toFixed(1)}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{r.body}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your stay</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="text-sm">
                  <p className="text-muted-foreground">From</p>
                  <p className="text-lg font-semibold">${selectedRoom?.pricePerNight ?? hotel.pricePerNight}/night</p>
                </div>
                <Separator />
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stay</span>
                    <span className="font-medium">{stayLabel ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{guests || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rooms</span>
                    <span className="font-medium">{rooms}</span>
                  </div>
                </div>
                <Separator />
                <PriceLine selectedRoom={selectedRoom} nights={nights} rooms={rooms} />
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">予約に進む</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>予約内容の入力</DialogTitle>
                    </DialogHeader>
                    <BookingPanel
                      hotel={hotel}
                      selectedRoom={selectedRoom}
                      search={search}
                      onBooked={() => setDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              ${selectedRoom?.pricePerNight ?? hotel.pricePerNight}/night
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {selectedRoom?.name ?? "部屋を選択"} · {nights} nights
            </p>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>予約に進む</Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[90dvh] overflow-auto">
              <SheetHeader>
                <SheetTitle>予約内容の入力</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <BookingPanel
                  hotel={hotel}
                  selectedRoom={selectedRoom}
                  search={search}
                  onBooked={() => setSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </main>
  );
}


"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";

import { useBooking } from "@/components/booking/booking-provider";
import { getHotelById } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function parseYmd(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function calcNights(checkIn: Date | undefined, checkOut: Date | undefined) {
  if (!checkIn || !checkOut) return 1;
  return Math.max(1, differenceInCalendarDays(checkOut, checkIn));
}

function calcTotal(pricePerNight: number, nights: number, rooms: number) {
  return pricePerNight * nights * rooms;
}

function saveHistory(entry: {
  bookingRef: string;
  createdAt: string;
  hotelId: string;
  roomTypeId: string;
}) {
  try {
    const key = "booking-hotel-demo:history";
    const raw = localStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = [entry, ...list].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
  }
}

function QrPlaceholder({ className }: { className?: string }) {
  return (
    <div
      aria-label="QR code (mock)"
      className={cn("grid place-items-center rounded-xl border bg-muted/20 p-3", className)}
    >
      <div
        className="relative size-40 overflow-hidden rounded-lg bg-white"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 8px, rgba(0,0,0,0) 8px 14px), repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 8px, rgba(0,0,0,0) 8px 14px)",
        }}
      >
        <div className="absolute left-2 top-2 size-8 rounded bg-black/80" />
        <div className="absolute right-2 top-2 size-8 rounded bg-black/80" />
        <div className="absolute bottom-2 left-2 size-8 rounded bg-black/80" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded bg-black/80 px-2 py-1 text-[10px] font-medium text-white">DEMO</div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  const { booking, clearBooking } = useBooking();
  const [mailSent, setMailSent] = React.useState(false);
  const [fallbackCreatedAt] = React.useState(() => new Date().toISOString());

  const createdAt = booking?.createdAt ?? fallbackCreatedAt;
  const bookingRef = booking ? booking.bookingRef ?? `BH-${booking.hotelId}-${createdAt.slice(0, 10)}` : "";

  React.useEffect(() => {
    if (!booking) return;
    saveHistory({
      bookingRef,
      createdAt,
      hotelId: booking.hotelId,
      roomTypeId: booking.roomTypeId,
    });
  }, [booking, bookingRef, createdAt]);

  if (!booking) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">予約情報がありません</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground">
            <p>予約完了ページは、予約フローからアクセスしてください。</p>
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const hotel = getHotelById(booking.hotelId);
  const checkIn = parseYmd(booking.checkIn);
  const checkOut = parseYmd(booking.checkOut);
  const nights = calcNights(checkIn, checkOut);

  const roomType = hotel?.roomTypes.find((r) => r.id === booking.roomTypeId);
  const pricePerNight = roomType?.pricePerNight ?? hotel?.pricePerNight ?? 0;
  const total = calcTotal(pricePerNight, nights, booking.rooms);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-5" />
            <CardTitle className="text-base">予約が完了しました（モック）</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            デモのため、実際の予約は行われません。予約番号とQRコードは擬似表示です。
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">予約番号</p>
                <code className="rounded bg-muted px-2 py-1 text-sm">{bookingRef}</code>
              </div>
              <p className="text-sm text-muted-foreground">
                {checkIn && checkOut ? `${format(checkIn, "yyyy/MM/dd")} – ${format(checkOut, "yyyy/MM/dd")}` : "—"} ·{" "}
                {nights} nights
              </p>
            </div>

            <QrPlaceholder className="sm:justify-self-end" />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden">
              <div className="relative h-40">
                <Image
                  src={
                    hotel?.images[0] ??
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
                  }
                  alt={hotel?.name ?? booking.hotelId}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-sm font-semibold text-white">{hotel?.name ?? booking.hotelId}</p>
                  <p className="text-xs text-white/80">{hotel?.address ?? "—"}</p>
                </div>
              </div>
              <CardContent className="grid gap-3 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium">{roomType?.name ?? booking.roomTypeId}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">
                    {booking.adults + booking.children} (Adults {booking.adults} / Children {booking.children})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Rooms</span>
                  <span className="font-medium">{booking.rooms}</span>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground text-sm">
                    ${pricePerNight}/night × {nights} × {booking.rooms}
                  </span>
                  <span className="text-lg font-semibold">${total}</span>
                </div>
                <p className="text-xs text-muted-foreground">Taxes and fees are not included (demo).</p>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">予約者情報</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm text-muted-foreground">
                  <p>
                    {booking.lastName} {booking.firstName}
                  </p>
                  <p>{booking.email}</p>
                  {booking.phone ? <p>{booking.phone}</p> : null}
                  {booking.specialRequests ? (
                    <div className="rounded-lg border bg-muted/10 p-3 text-sm">
                      <p className="text-xs font-medium text-foreground">特記事項</p>
                      <p className="mt-1 text-sm text-muted-foreground">{booking.specialRequests}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">アクション</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button asChild onClick={clearBooking}>
                    <Link href="/">トップへ戻る</Link>
                  </Button>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => setMailSent(true)} disabled={mailSent}>
                      {mailSent ? "メール送信済み（モック）" : "予約詳細メール送信（モック）"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.print();
                      }}
                    >
                      PDFダウンロード（モック）
                    </Button>
                  </div>

                  <Button variant="ghost" onClick={clearBooking} asChild>
                    <Link href={hotel ? `/hotel/${hotel.id}` : "/search"}>ホテル詳細を見る</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

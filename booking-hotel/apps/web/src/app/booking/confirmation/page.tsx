"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

import { useBooking } from "@/components/booking/booking-provider";
import { getHotelById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function parseYmd(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export default function BookingConfirmationPage() {
  const { booking, clearBooking } = useBooking();

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

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-5" />
            <CardTitle className="text-base">予約が完了しました（モック）</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">デモのため、実際の予約は行われません。</p>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="grid gap-1">
            <p className="font-medium">{hotel?.name ?? booking.hotelId}</p>
            <p className="text-muted-foreground">
              {checkIn && checkOut ? `${format(checkIn, "yyyy/MM/dd")} – ${format(checkOut, "yyyy/MM/dd")}` : "—"}
            </p>
          </div>
          <Separator />
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>
              Guest: {booking.lastName} {booking.firstName}
            </p>
            <p>Email: {booking.email}</p>
            <p>
              Rooms: {booking.rooms} · Guests: {booking.adults + booking.children} (Adults {booking.adults} / Children{" "}
              {booking.children})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild onClick={clearBooking}>
              <Link href="/">Back to home</Link>
            </Button>
            <Button variant="outline" onClick={clearBooking} asChild>
              <Link href={hotel ? `/hotel/${hotel.id}` : "/search"}>View hotel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


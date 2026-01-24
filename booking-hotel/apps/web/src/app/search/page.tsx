import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDestinations, getHotelsByDestination } from "@/lib/data";

type SearchParams = Record<string, string | string[] | undefined>;

type SearchPageProps = {
  searchParams?: Promise<SearchParams>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined, fallback: number) {
  const n = value ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};

  const destinationId = first(params.destinationId);
  const checkIn = first(params.checkIn);
  const checkOut = first(params.checkOut);
  const adults = toNumber(first(params.adults), 2);
  const children = toNumber(first(params.children), 0);
  const rooms = toNumber(first(params.rooms), 1);

  const destination = getDestinations().find((d) => d.id === destinationId);
  const hotels = destinationId ? getHotelsByDestination(destinationId) : [];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">
          Issue-002 の到達確認用の簡易結果ページです（フィルタ/ソートは Issue-003 で実装）。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">検索条件</CardTitle>
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
          <p className="text-muted-foreground">
            検索フォームから遷移できていればOKです。次の Issue で一覧UI/フィルタを作り込みます。
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Hotels</h2>
          <p className="text-sm text-muted-foreground">{destination ? `${hotels.length} 件` : ""}</p>
        </div>

        {!destination ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              目的地を選択して検索してください。
            </CardContent>
          </Card>
        ) : hotels.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              条件に合うホテルが見つかりませんでした。
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((h) => (
              <Card key={h.id} className="overflow-hidden">
                <div className="relative h-44">
                  <Image
                    src={h.images[0] ?? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"}
                    alt={h.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{h.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{h.shortDescription}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="secondary">★ {h.rating.toFixed(1)}</Badge>
                  <Badge variant="secondary">from ${h.pricePerNight}/night</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

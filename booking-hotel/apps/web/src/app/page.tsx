import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPopularDestinations } from "@/lib/data";

export default function Home() {
  const destinations = getPopularDestinations(6);

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Effortless Luxury stays, curated for you.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Frontend-only UI demo (no API). Mock data + shadcn/ui foundation are ready for
          screen-by-screen implementation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Popular destinations</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <div className="relative h-44">
                <Image
                  src={d.imageUrl}
                  alt={d.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between gap-2">
                  <span>{d.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">{d.country}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{d.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

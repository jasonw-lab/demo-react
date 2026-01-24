import Image from "next/image";

import { SearchForm } from "@/components/search-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPopularDestinations } from "@/lib/data";

export default function Home() {
  const destinations = getPopularDestinations(6);

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <section className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1501117716987-c8e1ecb210a9?auto=format&fit=crop&w=2400&q=80"
            alt="Luxury hotel room"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
        </div>

        <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 motion-reduce:animate-none lg:py-6">
            <p className="text-sm font-medium tracking-wide text-white/80">Booking Hotel Demo</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Effortless Luxury stays, curated for you.
            </h1>
            <p className="max-w-xl text-white/80">
              APIなしのUIデモです。目的地と日付を選んで、検索体験を確認できます。
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-white/75">
              <span className="rounded-full bg-white/10 px-3 py-1">Next.js App Router</span>
              <span className="rounded-full bg-white/10 px-3 py-1">shadcn/ui</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Zod validation</span>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 motion-reduce:animate-none">
            <SearchForm />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Popular destinations</h2>
          <p className="text-sm text-muted-foreground">Pick a city and start planning.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Card
              key={d.id}
              className="group overflow-hidden transition-shadow hover:shadow-lg motion-reduce:transition-none"
            >
              <div className="relative h-44">
                <Image
                  src={d.imageUrl}
                  alt={d.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
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

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Skeleton className="h-[520px] w-full rounded-2xl" />
          <Skeleton className="h-[480px] w-full rounded-2xl" />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </div>
      </div>
    </main>
  );
}


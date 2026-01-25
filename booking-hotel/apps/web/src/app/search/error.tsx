"use client";

import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  void error;

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">検索結果の表示に失敗しました。もう一度お試しください。</p>
      <div>
        <Button onClick={reset}>Retry</Button>
      </div>
    </main>
  );
}

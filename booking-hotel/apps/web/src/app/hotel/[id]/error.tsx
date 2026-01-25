"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  void error;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ページの読み込みに失敗しました</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>再試行するか、検索ページに戻ってください。</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset}>Retry</Button>
            <Button asChild variant="outline">
              <Link href="/search">Back to search</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

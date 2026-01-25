import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ホテルが見つかりませんでした</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>URLが正しいか確認してください。</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">Search</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


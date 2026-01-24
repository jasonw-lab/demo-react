export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Booking Hotel Demo</p>
        <p>UI demo only — no API, no real bookings.</p>
      </div>
    </footer>
  );
}


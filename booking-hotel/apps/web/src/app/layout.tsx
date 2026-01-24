import type { Metadata } from "next";
import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Booking Hotel Demo",
  description: "Hotel booking UI demo (frontend-only)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-sans">
        <Header />
        <div className="min-h-[calc(100dvh-3.5rem)]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

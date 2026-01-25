"use client";

import * as React from "react";

import type { BookingInfo } from "@/types";

type BookingContextValue = {
  booking: BookingInfo | null;
  setBooking: (booking: BookingInfo) => void;
  clearBooking: () => void;
};

const BookingContext = React.createContext<BookingContextValue | null>(null);

const STORAGE_KEY = "booking-hotel-demo:booking";

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [booking, setBookingState] = React.useState<BookingInfo | null>(null);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setBookingState(JSON.parse(raw) as BookingInfo);
    } catch {
      setBookingState(null);
    }
  }, []);

  React.useEffect(() => {
    try {
      if (!booking) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
      }
    } catch {
    }
  }, [booking]);

  const setBooking = React.useCallback((next: BookingInfo) => {
    setBookingState(next);
  }, []);

  const clearBooking = React.useCallback(() => {
    setBookingState(null);
  }, []);

  const value = React.useMemo(
    () => ({
      booking,
      setBooking,
      clearBooking,
    }),
    [booking, clearBooking, setBooking],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = React.useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within <BookingProvider />");
  }
  return ctx;
}

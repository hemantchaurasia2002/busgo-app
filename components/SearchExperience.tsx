"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SeatMap, type Seat } from "@/components/SeatMap";
import { useSession } from "@/lib/auth-client";

type BusResult = {
  id: string;
  busNumber: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  totalSeats: number;
  availableSeats: number;
};

type BookingReceipt = {
  seatNumber: string;
  busNumber: string;
  fromCity: string;
  toCity: string;
};

const fieldClass =
  "mt-1 w-full rounded-lg border border-[#eadede] bg-[#fffafa] px-3 py-2.5 text-[#1d1d1d] outline-none transition focus:border-[#d84e55] focus:ring-2 focus:ring-[#d84e55]/20";

export function SearchExperience() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session } = useSession();
  const [fromCity, setFromCity] = useState(params.get("fromCity") ?? "Mumbai");
  const [toCity, setToCity] = useState(params.get("toCity") ?? "Pune");
  const [date, setDate] = useState(params.get("date") ?? "2026-11-01");
  const [buses, setBuses] = useState<BusResult[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [booking, setBooking] = useState(false);
  const [searched, setSearched] = useState(false);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  async function search(nextFrom = fromCity, nextTo = toCity, nextDate = date) {
    setPending(true);
    setError(null);
    setSeats([]);
    setSelectedBusId(null);
    setSelectedSeatId(null);
    setReceipt(null);

    const query = new URLSearchParams({
      fromCity: nextFrom,
      toCity: nextTo,
      date: nextDate,
    });
    const response = await fetch(`/api/buses/search?${query.toString()}`);
    const body = (await response.json()) as { buses?: BusResult[]; error?: string };

    setPending(false);
    setSearched(true);

    if (!response.ok) {
      setBuses([]);
      setError(body.error ?? "Search failed");
      return;
    }

    setBuses(body.buses ?? []);
  }

  useEffect(() => {
    const from = params.get("fromCity");
    const to = params.get("toCity");
    const day = params.get("date");
    if (from && to && day) {
      void search(from, to, day);
    }
    // Run only when the query string changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams({ fromCity, toCity, date });
    router.replace(`/search?${query.toString()}`);
    await search();
  }

  async function selectBus(busId: string) {
    setSelectedBusId(busId);
    setSelectedSeatId(null);
    setReceipt(null);
    setError(null);

    const response = await fetch(`/api/buses/${busId}/seats`);
    const body = (await response.json()) as { seats?: Seat[]; error?: string };

    if (!response.ok) {
      setSeats([]);
      setError(body.error ?? "Could not load seats");
      return;
    }

    setSeats(body.seats ?? []);
  }

  async function proceed() {
    if (!selectedSeatId) return;
    if (!session?.user) {
      const next = `/search?fromCity=${encodeURIComponent(fromCity)}&toCity=${encodeURIComponent(toCity)}&date=${date}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setBooking(true);
    setError(null);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatId: selectedSeatId }),
    });
    const body = (await response.json()) as {
      error?: string;
      booking?: BookingReceipt;
    };
    setBooking(false);

    if (!response.ok || !body.booking) {
      setError(body.error ?? "Could not complete booking");
      return;
    }

    setReceipt(body.booking);
    setSeats((current) =>
      current.map((seat) =>
        seat.id === selectedSeatId ? { ...seat, isBooked: true } : seat,
      ),
    );
    setSelectedSeatId(null);
  }

  const selectedBus = buses.find((bus) => bus.id === selectedBusId);
  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <form
        onSubmit={onSubmit}
        className="animate-rise grid gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(216,78,85,0.12)] sm:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <label className="text-xs font-semibold uppercase tracking-wide text-[#d84e55]">
          From
          <input
            required
            value={fromCity}
            onChange={(event) => setFromCity(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-[#d84e55]">
          To
          <input
            required
            value={toCity}
            onChange={(event) => setToCity(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-[#d84e55]">
          Date
          <input
            required
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="self-end rounded-lg bg-[#d84e55] px-6 py-2.5 font-bold text-white transition hover:bg-[#b4232c] disabled:opacity-60"
        >
          {pending ? "Searching..." : "Search buses"}
        </button>
      </form>

      {error ? (
        <p className="rounded-xl bg-[#fff1f1] px-4 py-3 text-sm font-medium text-[#b4232c]">
          {error}
        </p>
      ) : null}

      {receipt ? (
        <p className="animate-rise rounded-xl bg-[#e9f8ef] px-4 py-3 text-sm font-medium text-[#157347]">
          Seat {receipt.seatNumber} on {receipt.busNumber} is booked, {receipt.fromCity} to{" "}
          {receipt.toCity}.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ul className="flex flex-col gap-3">
          {buses.map((bus, index) => {
            const departure = new Date(bus.departureDate);
            const active = bus.id === selectedBusId;
            return (
              <li
                key={bus.id}
                className="animate-rise"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <button
                  type="button"
                  onClick={() => selectBus(bus.id)}
                  className={[
                    "flex w-full items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                    active ? "ring-2 ring-[#d84e55]" : "",
                  ].join(" ")}
                >
                  <div>
                    <p className="text-2xl font-bold text-[#1d1d1d]">
                      {departure.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-sm text-[#6b6b7b]">
                      {bus.fromCity} → {bus.toCity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#d84e55]">{bus.busNumber}</p>
                    <p className="text-sm text-[#6b6b7b]">
                      {bus.availableSeats}/{bus.totalSeats} seats
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {selectedBus ? (
          <section className="animate-rise h-fit rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#1d1d1d]">Select a seat</h2>
            <p className="mb-4 text-sm text-[#6b6b7b]">
              {selectedBus.busNumber} · {selectedBus.fromCity} to {selectedBus.toCity}
            </p>
            <SeatMap
              seats={seats}
              selectedSeatId={selectedSeatId}
              onSelect={setSelectedSeatId}
            />
          </section>
        ) : (
          <section className="hidden h-fit rounded-3xl border border-dashed border-[#f0c8cb] bg-white/70 p-8 text-center text-sm text-[#6b6b7b] lg:block">
            Pick a bus to open the seat map.
          </section>
        )}
      </div>

      {searched && buses.length === 0 && !error ? (
        <p className="text-sm text-[#6b6b7b]">No buses match that search.</p>
      ) : null}

      {selectedSeat ? (
        <div className="animate-slide-up fixed inset-x-0 bottom-0 z-30 border-t border-[#f0c8cb] bg-white px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#d84e55]">
                Selected seat
              </p>
              <p className="text-lg font-bold">{selectedSeat.seatNumber}</p>
            </div>
            <button
              type="button"
              onClick={proceed}
              disabled={booking}
              className="rounded-xl bg-[#d84e55] px-8 py-3 text-base font-bold text-white transition hover:bg-[#b4232c] disabled:opacity-60"
            >
              {booking ? "Booking..." : "Proceed"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

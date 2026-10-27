"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const routes = [
  { from: "Mumbai", to: "Pune" },
  { from: "Delhi", to: "Jaipur" },
  { from: "Pune", to: "Mumbai" },
];

export default function Home() {
  const router = useRouter();
  const [fromCity, setFromCity] = useState("Mumbai");
  const [toCity, setToCity] = useState("Pune");
  const [date, setDate] = useState("2026-11-01");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams({ fromCity, toCity, date });
    router.push(`/search?${query.toString()}`);
  }

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#d84e55] via-[#e46a70] to-[#f7b2b6] text-white">
        <div className="animate-rise mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Bus tickets
            </p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">
              Book a seat. Skip the counter.
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Search intercity buses, pick a seat, and proceed in one flow.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="grid gap-3 rounded-2xl bg-white p-4 text-[#1d1d1d] shadow-xl sm:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <label className="text-xs font-semibold uppercase tracking-wide text-[#d84e55]">
              From
              <input
                required
                value={fromCity}
                onChange={(event) => setFromCity(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#eadede] px-3 py-2.5 outline-none focus:border-[#d84e55]"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#d84e55]">
              To
              <input
                required
                value={toCity}
                onChange={(event) => setToCity(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#eadede] px-3 py-2.5 outline-none focus:border-[#d84e55]"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#d84e55]">
              Date
              <input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#eadede] px-3 py-2.5 outline-none focus:border-[#d84e55]"
              />
            </label>
            <button
              type="submit"
              className="self-end rounded-lg bg-[#d84e55] px-6 py-2.5 font-bold text-white transition hover:bg-[#b4232c]"
            >
              Search buses
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {routes.map((route, index) => (
          <button
            key={`${route.from}-${route.to}`}
            type="button"
            onClick={() => {
              const query = new URLSearchParams({
                fromCity: route.from,
                toCity: route.to,
                date,
              });
              router.push(`/search?${query.toString()}`);
            }}
            className="animate-rise rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-[#d84e55]">
              Popular
            </p>
            <p className="mt-2 text-xl font-bold">
              {route.from} → {route.to}
            </p>
            <p className="mt-1 text-sm text-[#6b6b7b]">Tap to see seats</p>
          </button>
        ))}
      </section>
    </main>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink, EmptyState, Icon } from "@/components/ui";
import {
  apiFetch,
  cityImage,
  formatDateRange,
  formatMoney,
  tripCover,
  type TripDto,
} from "@/lib/client-api";

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      apiFetch<TripDto>(`/api/share/${token}`)
        .then(setTrip)
        .catch((err) => setError(err instanceof Error ? err.message : "Unable to load shared trip"))
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [token]);

  async function copyLink() {
    await navigator.clipboard?.writeText(window.location.href);
  }

  if (isLoading) {
    return <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_48%,#fff7ed_100%)] p-6"><div className="mx-auto h-[460px] max-w-7xl animate-pulse rounded-3xl bg-sky-50" /></main>;
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_48%,#fff7ed_100%)] p-6">
        <EmptyState title="Shared trip unavailable" body={error || "This public itinerary is not available."} action={<Link className="font-bold text-sky-600" href="/">Go home</Link>} />
      </main>
    );
  }

  const stops = trip.stops ?? [];
  const coverUrl = tripCover(trip);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_48%,#fff7ed_100%)]">
      <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500 font-bold text-white">T</span>
            <span className="font-bold text-slate-950">Traveloop</span>
          </Link>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void copyLink()} aria-label="Copy public link" className="hidden h-10 rounded-xl border border-sky-100 px-4 text-sm font-semibold text-slate-700 sm:block">Copy link</button>
            <ButtonLink href="/login">Copy this trip <Icon name="share" className="h-4 w-4" /></ButtonLink>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-sky-100">
          <div className="relative h-[460px] bg-sky-100">
            {coverUrl && <Image src={coverUrl} alt={`${trip.name} public itinerary`} fill preload className="object-cover" sizes="100vw" />}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">Public itinerary</p>
            <h1 className="mt-3 text-4xl font-semibold text-white md:text-6xl">{trip.name}</h1>
            <p className="mt-3 text-sky-50">{formatDateRange(trip.startDate, trip.endDate)} / {stops.length} cities / {formatMoney(trip.totalCost ?? 0)} estimated spend</p>
          </div>
        </section>

        <section className="grid gap-5">
          {stops.map((stop, index) => {
            const imageUrl = cityImage(stop.city);

            return (
            <article key={stop.id} className="surface-panel rounded-3xl p-5 md:p-6">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-500 font-semibold text-white">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-slate-950">{stop.city.name}, {stop.city.country}</h2>
                  <p className="mt-1 text-sm text-slate-500">{formatDateRange(stop.startDate, stop.endDate)}</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {stop.activities.map((activity) => (
                      <div key={activity.id} className="rounded-2xl border border-sky-100 bg-white p-4">
                        <p className="font-bold text-slate-950">{activity.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{activity.startTime ?? "Flexible"} / {activity.duration} min</p>
                      </div>
                    ))}
                    {stop.activities.length === 0 && <p className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-500">No activities listed for this stop.</p>}
                  </div>
                </div>
                {imageUrl && (
                  <div className="relative hidden h-24 w-32 overflow-hidden rounded-2xl md:block">
                    <Image src={imageUrl} alt={stop.city.name} fill className="object-cover" sizes="128px" />
                  </div>
                )}
              </div>
            </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

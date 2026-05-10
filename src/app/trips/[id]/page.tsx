"use client";

import { use, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon, ProgressBar } from "@/components/ui";
import {
  apiFetch,
  cityImage,
  formatDateRange,
  formatMoney,
  tripCover,
  type TripDto,
} from "@/lib/client-api";

export default function TripViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadTrip = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setTrip(await apiFetch<TripDto>(`/api/trips/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trip");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTrip();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTrip]);

  async function shareTrip() {
    setError("");
    setNotice("");

    try {
      const result = await apiFetch<{ shareUrl: string }>(`/api/trips/${id}/share`, { method: "POST" });
      await navigator.clipboard?.writeText(result.shareUrl);
      setNotice("Public link copied to clipboard");
      await loadTrip();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to share trip");
    }
  }

  if (isLoading) {
    return (
      <AppShell active="My Trips">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-72 animate-pulse rounded-2xl bg-sky-50" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-sky-50" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!trip) {
    return (
      <AppShell active="My Trips">
        <EmptyState
          title="Trip unavailable"
          body={error || "This trip could not be loaded. Log in again or choose another trip."}
          action={<Link className="font-bold text-sky-600" href="/trips">Back to trips</Link>}
        />
      </AppShell>
    );
  }

  const stops = trip.stops ?? [];
  const spent = trip.totalCost ?? 0;
  const allocated = trip.budget?.totalAllocated || trip.budget?.activities || spent || 1;
  const budgetProgress = Math.round((spent / allocated) * 100);
  const coverUrl = tripCover(trip);

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        <section className="relative min-h-[280px] overflow-hidden rounded-2xl border border-sky-100 bg-sky-100 shadow-xl shadow-sky-900/8">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt={trip.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 flex items-end p-6 md:p-8">
            <div className="flex w-full items-end justify-between gap-4">
              <div>
                <span className="inline-block rounded-full border border-white/30 bg-white/85 px-3 py-1 text-xs font-bold text-sky-700 backdrop-blur">
                  {trip.isPublic ? "Public" : "Private"}
                </span>
                <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
                  {trip.name}
                </h1>
                <p className="mt-2 text-sm text-sky-100">{formatDateRange(trip.startDate, trip.endDate)}</p>
              </div>
              <div className="hidden text-right md:block">
                <p className="text-3xl font-black text-white">
                  {formatMoney(allocated)}
                </p>
                <p className="mt-1 text-sm text-sky-100">allocated budget</p>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <Icon name="trips" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{stops.length}</p>
                <p className="text-xs text-slate-500">Cities</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Icon name="budget" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{budgetProgress}%</p>
                <p className="text-xs text-slate-500">Budget used</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon name="check" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{trip._count?.checklist ?? 0}</p>
                <p className="text-xs text-slate-500">Packing items</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <Icon name="notes" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{trip._count?.notes ?? 0}</p>
                <p className="text-xs text-slate-500">Notes</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Budget Overview</h2>
            <span className="text-sm text-slate-500">
              {formatMoney(spent)} of {formatMoney(allocated)}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={budgetProgress} />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-950">Route</h2>
          <span className="h-px flex-1 bg-sky-100" />
        </div>

        {stops.length === 0 ? (
          <EmptyState
            title="No stops yet"
            body="Open the builder to add cities and activities to this trip."
            action={<Link className="font-bold text-sky-600" href={`/trips/${trip.id}/build`}>Build itinerary</Link>}
          />
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stops.map((stop, index) => {
              const imageUrl = cityImage(stop.city);

              return (
              <article
                key={stop.id}
                className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
              >
                <div className="relative h-40 bg-sky-100">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={stop.city.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold text-sky-100 backdrop-blur">
                      Stop {index + 1}
                    </span>
                    <h3 className="mt-1 text-lg font-black text-white">
                      {stop.city.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-500">
                    {stop.city.flag} {stop.city.country} · {formatDateRange(stop.startDate, stop.endDate)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {stop.activities.length} activities
                    </span>
                    <span className="font-bold text-slate-950">
                      Cost: {stop.city.costIndex}/100
                    </span>
                  </div>
                </div>
              </article>
              );
            })}
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Link href={`/trips/${trip.id}/build`} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]">
            <Icon name="calendar" className="h-4 w-4" />
            Build Itinerary
          </Link>
          <Link href={`/trips/${trip.id}/budget`} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50">
            <Icon name="budget" className="h-4 w-4" />
            Budget Details
          </Link>
          <Link href={`/trips/${trip.id}/checklist`} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50">
            <Icon name="check" className="h-4 w-4" />
            Packing List
          </Link>
          <Link href={`/trips/${trip.id}/notes`} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50">
            <Icon name="notes" className="h-4 w-4" />
            Trip Notes
          </Link>
          <button type="button" onClick={() => void shareTrip()} className="flex h-14 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50">
            <Icon name="share" className="h-4 w-4" />
            Share
          </button>
        </section>
      </div>
    </AppShell>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import { apiList, cityImage, formatDateRange, tripCover, type TripDto } from "@/lib/client-api";

export default function CommunityPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const popularCities = useMemo(() => {
    const counts = new Map<string, number>();

    for (const trip of trips) {
      for (const stop of trip.stops ?? []) {
        const key = stop.city.name;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([city]) => city);
  }, [trips]);

  const loadCommunity = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams({
      limit: "24",
      sortBy: "recent",
    });

    if (query.trim()) {
      params.set("q", query.trim());
    }

    try {
      const result = await apiList<TripDto>(`/api/community?${params.toString()}`);
      setTrips(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load community trips");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCommunity();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCommunity]);

  return (
    <AppShell active="Community">
      <div className="mx-auto max-w-7xl space-y-6 pb-24 lg:pb-0">
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search community trips"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search shared trips, cities..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadCommunity()}
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
          >
            Search
          </button>
          <Link
            href="/trips/new"
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 inline-flex items-center justify-center"
          >
            Plan trip
          </Link>
          <Link
            href="/trips"
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 inline-flex items-center justify-center"
          >
            My trips
          </Link>
        </section>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h1 className="shrink-0 text-xl font-black text-slate-950">Community Trips</h1>
              <span className="text-sm text-slate-500">{trips.length} shared itineraries</span>
              <span className="h-px flex-1 bg-sky-100" />
            </div>

            {isLoading ? (
              <section className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-52 animate-pulse rounded-2xl bg-sky-50" />
                ))}
              </section>
            ) : trips.length === 0 ? (
              <EmptyState
                title="No public trips yet"
                body="No user-shared itineraries are available right now."
                action={
                  <Link href="/trips/new" className="font-bold text-sky-600">
                    Create a trip
                  </Link>
                }
              />
            ) : (
              trips.map((trip) => {
                const cover = tripCover(trip) || cityImage(trip.stops?.[0]?.city ?? { imageUrl: null });
                const authorName = `${trip.user?.firstName ?? ""} ${trip.user?.lastName ?? ""}`.trim() || "Traveler";
                const authorInitials =
                  `${trip.user?.firstName?.[0] ?? ""}${trip.user?.lastName?.[0] ?? ""}`.toUpperCase() || "TR";
                const cities = trip.stops?.map((stop) => stop.city.name) ?? [];
                const shareHref = trip.shareToken ? `/share/${trip.shareToken}` : `/trips/${trip.id}`;

                return (
                  <article
                    key={trip.id}
                    className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
                  >
                    <div className="grid md:grid-cols-[220px_1fr]">
                      <div className="relative min-h-[180px] bg-sky-100">
                        {cover && (
                          <Image
                            src={cover}
                            alt={trip.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 220px"
                          />
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-black text-white shadow-lg shadow-sky-200">
                            {authorInitials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-950">{authorName}</p>
                            <p className="text-xs text-slate-500">Shared itinerary</p>
                          </div>
                        </div>

                        <h2 className="mt-4 text-lg font-black text-slate-950">{trip.name}</h2>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(cities.length ? cities : ["No stops yet"]).map((city) => (
                            <span
                              key={`${trip.id}-${city}`}
                              className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
                            >
                              {city}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-sky-50 pt-4">
                          <div className="flex gap-5 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Icon name="calendar" className="h-4 w-4" />
                              {trip.stopCount ?? trip.stops?.length ?? 0} stops
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon name="community" className="h-4 w-4" />
                              {trip._count?.notes ?? 0} notes
                            </span>
                          </div>
                          <Link
                            href={shareHref}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 transition hover:text-sky-500"
                          >
                            View trip
                            <Icon name="arrow" className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <aside className="space-y-5">
            <div className="surface-panel rounded-2xl p-5">
              <h3 className="text-lg font-black text-slate-950">About Community</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Discover user-shared itineraries and save routes you want to copy into your own plan.
              </p>
              <Link
                href="/trips/new"
                className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
              >
                <Icon name="share" className="h-4 w-4" />
                Share your trip
              </Link>
            </div>

            <div className="surface-panel rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-black text-slate-950">Popular Cities</h3>
              <div className="flex flex-wrap gap-2">
                {popularCities.length > 0 ? (
                  popularCities.map((city) => (
                    <span
                      key={city}
                      className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      {city}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No city trends yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon, ProgressBar } from "@/components/ui";
import {
  apiFetch,
  apiList,
  clearAuth,
  formatDateRange,
  formatMoney,
  getAuthToken,
  tripCover,
  type TripDto,
} from "@/lib/client-api";

const statusColors: Record<string, string> = {
  Ongoing: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Upcoming: "bg-sky-50 text-sky-600 border-sky-200",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
  Draft: "bg-amber-50 text-amber-600 border-amber-200",
};

type StatusFilter = "all" | "upcoming" | "past" | "draft";
type SortFilter = "newest" | "oldest" | "budget";

function getStatus(trip: TripDto) {
  if (!trip.stops?.length && !trip.stopCount) {
    return "Draft";
  }

  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (start > now) {
    return "Upcoming";
  }

  if (end < now) {
    return "Completed";
  }

  return "Ongoing";
}

export default function TripsPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter | "Draft" | "Ongoing" | "Upcoming" | "Completed">("all");
  const [sortBy, setSortBy] = useState<SortFilter>("newest");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(Boolean(getAuthToken()));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadTrips = useCallback(async () => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const params = new URLSearchParams({ limit: "50", sortBy });

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (status !== "all" && status !== "Ongoing" && status !== "Upcoming" && status !== "Completed") {
      params.set("status", status);
    }

    try {
      const result = await apiList<TripDto>(`/api/trips?${params.toString()}`);
      setTrips(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load trips";
      setError(message);

      if (message.toLowerCase().includes("authentication")) {
        clearAuth();
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, sortBy, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTrips();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTrips]);

  async function deleteTrip(id: string) {
    setError("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/trips/${id}`, { method: "DELETE" });
      setTrips((current) => current.filter((trip) => trip.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete trip");
    }
  }

  async function shareTrip(id: string) {
    setError("");

    try {
      const result = await apiFetch<{ shareUrl: string }>(`/api/trips/${id}/share`, { method: "POST" });
      await navigator.clipboard?.writeText(result.shareUrl);
      setTrips((current) =>
        current.map((trip) => (trip.id === id ? { ...trip, isPublic: true } : trip)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to share trip");
    }
  }

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search trips"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search trips, cities, dates..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          <select
            aria-label="Trip sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortFilter)}
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="budget">Highest cost</option>
          </select>
          <button
            type="button"
            onClick={() => void loadTrips()}
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
          >
            Refresh
          </button>
        </section>

        <div className="flex flex-wrap items-center gap-2 border-b border-sky-100 pb-1">
          {(["all", "Ongoing", "Upcoming", "Completed", "draft"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-6 py-3 text-sm font-black uppercase tracking-wider transition-all relative ${
                status === tab 
                  ? "text-[#ff5a3d]" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
              {status === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff5a3d] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-950">My Trips</h1>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
              {trips.length} trips
            </span>
          </div>
          <Link
            href="/trips/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff5a3d] px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
          >
            <Icon name="plus" className="h-4 w-4" />
            Plan a trip
          </Link>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {!isLoggedIn ? (
          <EmptyState
            title="Log in to manage your trips"
            body="Your trip workspace is protected. Sign in or create an account to create itineraries, budgets, notes, checklists, and public share links."
            action={
              <Link className="font-bold text-sky-600" href="/login">
                Go to login
              </Link>
            }
          />
        ) : isLoading ? (
          <section className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-2xl bg-sky-50" />
            ))}
          </section>
        ) : trips.length === 0 ? (
          <EmptyState
            title="No trips yet"
            body="Create your first trip and add stops, activities, budgets, packing items, and notes."
            action={
              <Link className="font-bold text-sky-600" href="/trips/new">
                Plan your first trip
              </Link>
            }
          />
        ) : (
          <section className="space-y-5">
            {trips
              .filter((trip) => {
                if (status === "all") return true;
                return getStatus(trip).toLowerCase() === status.toLowerCase();
              })
              .map((trip) => {
              const statusLabel = getStatus(trip);
              const spent = trip.totalCost ?? 0;
              const budget = trip.budget?.totalAllocated || trip.budget?.activities || spent || 1;
              const progress = Math.round((spent / budget) * 100);
              const cities = trip.stops?.map((stop) => stop.city.name) ?? [];
              const imageUrl = tripCover(trip);

              return (
                <article
                  key={trip.id}
                  className="lift-card grid overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5 md:grid-cols-[280px_1fr]"
                >
                  <Link href={`/trips/${trip.id}`} className="relative min-h-[200px] bg-sky-100">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={trip.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 280px"
                      />
                    )}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold backdrop-blur ${statusColors[statusLabel]}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/trips/${trip.id}`} className="text-xl font-black text-slate-950 hover:text-sky-600">
                            {trip.name}
                          </Link>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDateRange(trip.startDate, trip.endDate)}
                          </p>
                        </div>
                        <span className="hidden rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600 md:inline-block">
                          {trip.isPublic ? "Public" : "Private"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(cities.length ? cities : ["No stops yet"]).map((city) => (
                          <span
                            key={city}
                            className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-slate-600"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-sky-50 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Estimated: {formatMoney(spent)} / {formatMoney(budget)}
                        </span>
                        <span className="font-bold text-slate-950">{progress}%</span>
                      </div>
                      <ProgressBar value={progress} />

                      <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Icon name="notes" className="h-3.5 w-3.5" />
                          {trip._count?.notes ?? 0} notes
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="check" className="h-3.5 w-3.5" />
                          {trip._count?.checklist ?? 0} packing items
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="trips" className="h-3.5 w-3.5" />
                          {trip.stopCount ?? trip.stops?.length ?? 0} cities
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link className="rounded-lg border border-sky-100 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50" href={`/trips/${trip.id}/build`}>
                          Build
                        </Link>
                        <button className="rounded-lg border border-sky-100 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50" type="button" onClick={() => void shareTrip(trip.id)}>
                          Share
                        </button>
                        <button className="rounded-lg border border-rose-100 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50" type="button" onClick={() => void deleteTrip(trip.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}

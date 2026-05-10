"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import { apiList, apiFetch, cityImage, formatDateRange, tripCover, type TripDto } from "@/lib/client-api";
import { Share2, X, Check, Copy, Globe, Lock } from "lucide-react";

export default function CommunityPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [userTrips, setUserTrips] = useState<TripDto[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<{ id: string; url: string } | null>(null);

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

  const loadUserTrips = async () => {
    try {
      const result = await apiList<TripDto>("/api/trips");
      setUserTrips(result.data);
    } catch (err) {
      console.error("Failed to load user trips", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadCommunity();
      }
    };
    void init();
    return () => { isMounted = false; };
  }, [loadCommunity]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted && isShareModalOpen) {
        await loadUserTrips();
      }
    };
    void init();
    return () => { isMounted = false; };
  }, [isShareModalOpen]);

  async function handleShareTrip(tripId: string) {
    setIsSharing(tripId);
    setError("");
    try {
      const result = await apiFetch<{ shareUrl: string }>(`/api/trips/${tripId}/share`, { method: "POST" });
      setShareResult({ id: tripId, url: result.shareUrl });
      await loadCommunity();
      await loadUserTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share trip");
    } finally {
      setIsSharing(null);
    }
  }

  async function handleRevokeShare(tripId: string) {
    setIsSharing(tripId);
    setError("");
    try {
      await apiFetch(`/api/trips/${tripId}/share`, { method: "DELETE" });
      setShareResult(null);
      await loadCommunity();
      await loadUserTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke sharing");
    } finally {
      setIsSharing(null);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    alert("Share link copied to clipboard!");
  }

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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-black text-white shadow-lg shadow-sky-200">
                              {authorInitials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-950">{authorName}</p>
                              <p className="text-xs text-slate-500">Shared itinerary</p>
                            </div>
                          </div>
                          {trip.isPublic && (
                             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                               <Globe className="h-3 w-3" /> Public
                             </div>
                          )}
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
            <div className="surface-panel rounded-2xl p-5 border-t-4 border-t-[#ff5a3d]">
              <h3 className="text-lg font-black text-slate-950">About Community</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Discover user-shared itineraries and save routes you want to copy into your own plan.
              </p>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="mt-5 flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d] active:scale-95"
              >
                <Share2 className="h-4 w-4" />
                Share your trip
              </button>
            </div>

            <div className="surface-panel rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-black text-slate-950">Popular Cities</h3>
              <div className="flex flex-wrap gap-2">
                {popularCities.length > 0 ? (
                  popularCities.map((city) => (
                    <span
                      key={city}
                      className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-sky-100 cursor-pointer transition-colors"
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

      {/* Share Trip Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-sky-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-sky-50 flex items-center justify-between bg-sky-50/30">
              <div>
                <h2 className="text-xl font-black text-slate-900">Share Your Itinerary</h2>
                <p className="text-sm text-slate-500 font-medium">Make your trip public for the community to discover</p>
              </div>
              <button 
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShareResult(null);
                }} 
                className="h-10 w-10 grid place-items-center rounded-full bg-white text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {userTrips.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 font-medium mb-4">You haven&apos;t created any trips yet.</p>
                  <Link href="/trips/new" className="px-6 py-2 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-100">
                    Create your first trip
                  </Link>
                </div>
              ) : (
                userTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 rounded-2xl border border-sky-50 bg-slate-50/50 hover:bg-white hover:border-sky-200 transition-all group">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 truncate">{trip.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${trip.isPublic ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {trip.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {trip.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {trip.isPublic ? (
                        <>
                          <button 
                            onClick={() => copyToClipboard(`${window.location.origin}/share/${trip.shareToken}`)}
                            className="h-9 px-3 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy Link
                          </button>
                          <button 
                            disabled={isSharing === trip.id}
                            onClick={() => handleRevokeShare(trip.id)}
                            className="h-9 w-9 grid place-items-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          disabled={isSharing === trip.id}
                          onClick={() => handleShareTrip(trip.id)}
                          className="h-9 px-4 rounded-lg bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-100 hover:bg-sky-700 disabled:opacity-50 transition-all"
                        >
                          {isSharing === trip.id ? "Sharing..." : "Share"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {shareResult && (
              <div className="m-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 animate-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-3">
                  <Check className="h-4 w-4" /> Trip successfully shared!
                </p>
                <div className="flex gap-2">
                  <input 
                    readOnly
                    value={shareResult.url}
                    className="flex-1 h-10 px-3 rounded-lg border border-emerald-200 bg-white text-xs text-slate-600 outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(shareResult.url)}
                    className="h-10 px-4 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

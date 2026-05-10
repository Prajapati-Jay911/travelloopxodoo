"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  type UserProfile,
} from "@/lib/client-api";

function isCompleted(trip: TripDto) {
  return new Date(trip.endDate) < new Date();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isLoggedIn = useMemo(() => Boolean(getAuthToken()), []);

  const completedTrips = useMemo(() => trips.filter(isCompleted), [trips]);
  const upcomingTrips = useMemo(() => trips.filter((trip) => !isCompleted(trip)), [trips]);
  const totalCities = useMemo(
    () =>
      trips.reduce((sum, trip) => {
        const unique = new Set((trip.stops ?? []).map((stop) => stop.city.id));
        return sum + unique.size;
      }, 0),
    [trips],
  );

  const loadProfile = useCallback(async () => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [userResult, tripsResult] = await Promise.all([
        apiFetch<UserProfile>("/api/users/profile"),
        apiList<TripDto>("/api/trips?limit=50&sortBy=newest"),
      ]);
      setProfile(userResult);
      setTrips(tripsResult.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load profile";
      setError(message);

      if (message.toLowerCase().includes("authentication")) {
        clearAuth();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  const initials = `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() || "U";
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Traveler";
  const subtitle = [profile?.city, profile?.country].filter(Boolean).join(", ");

  return (
    <AppShell active="Profile">
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {!isLoggedIn ? (
          <EmptyState
            title="Log in to view your profile"
            body="Sign in to view your profile and personal trip history."
            action={
              <Link href="/login" className="font-bold text-sky-600">
                Go to login
              </Link>
            }
          />
        ) : isLoading ? (
          <section className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-2xl bg-sky-50" />
            ))}
          </section>
        ) : (
          <>
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
              <div className="relative h-44 bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-300">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(255,255,255,0.25),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.15),transparent_50%)]" />
              </div>

              <div className="px-6 pb-6">
                <div className="-mt-16 mb-4">
                  {profile?.photo ? (
                    <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white shadow-xl shadow-sky-200">
                      <Image src={profile.photo} alt={name} fill className="object-cover" sizes="112px" />
                    </div>
                  ) : (
                    <div className="grid h-28 w-28 place-items-center rounded-2xl border-4 border-white bg-gradient-to-br from-sky-400 to-sky-600 text-3xl font-black text-white shadow-xl shadow-sky-200">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950">{name}</h1>
                    <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-500">
                      {subtitle || "Set your city and bio to personalize your profile."}
                    </p>
                    {profile?.bio && <p className="mt-1.5 max-w-lg text-sm text-slate-500">{profile.bio}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadProfile()}
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    <Icon name="profile" className="h-4 w-4" />
                    Refresh Profile
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-4">
              {[
                { label: "Total Trips", value: trips.length.toString(), icon: "trips" as const },
                { label: "Cities Visited", value: totalCities.toString(), icon: "search" as const },
                { label: "Completed", value: completedTrips.length.toString(), icon: "check" as const },
                { label: "Upcoming", value: upcomingTrips.length.toString(), icon: "calendar" as const },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600">
                      <Icon name={stat.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xl font-black text-slate-950">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <div className="flex items-center gap-3">
              <h2 className="shrink-0 text-xl font-black text-slate-950">Upcoming Trips</h2>
              <span className="h-px flex-1 bg-sky-100" />
            </div>
            {upcomingTrips.length === 0 ? (
              <EmptyState
                title="No upcoming trips"
                body="Create a new trip to see it here."
                action={
                  <Link href="/trips/new" className="font-bold text-sky-600">
                    Plan a trip
                  </Link>
                }
              />
            ) : (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingTrips.map((trip) => {
                  const budget = trip.budget?.totalAllocated || 1;
                  const spent = trip.totalCost ?? 0;
                  const progress = Math.round((spent / budget) * 100);
                  const cover = tripCover(trip);

                  return (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}`}
                      className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
                    >
                      <div className="relative h-36 bg-sky-100">
                        {cover && (
                          <Image
                            src={cover}
                            alt={trip.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-black text-white">{trip.name}</h3>
                          <p className="text-xs text-sky-100">{formatDateRange(trip.startDate, trip.endDate)}</p>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{formatMoney(spent)} spent</span>
                          <span>{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                    </Link>
                  );
                })}
              </section>
            )}

            {completedTrips.length > 0 && (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="shrink-0 text-xl font-black text-slate-950">Completed Trips</h2>
                  <span className="h-px flex-1 bg-sky-100" />
                </div>
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {completedTrips.map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}`}
                      className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
                    >
                      <div className="relative h-36 bg-sky-100">
                        <div className="absolute inset-0 bg-slate-950/20" />
                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-slate-900/60 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur">
                            Completed ✓
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-black text-white">{trip.name}</h3>
                          <p className="text-xs text-sky-100">{formatDateRange(trip.startDate, trip.endDate)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

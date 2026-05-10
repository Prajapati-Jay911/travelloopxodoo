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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    bio: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(Boolean(getAuthToken()));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
      setEditForm({
        firstName: userResult.firstName || "",
        lastName: userResult.lastName || "",
        city: userResult.city || "",
        country: userResult.country || "",
        bio: userResult.bio || "",
      });
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

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setIsSaving(false);
    }
  };

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
            <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-sky-900/10">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
                  alt="Profile Banner"
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>

              <div className="relative px-8 pb-10">
                <div className="-mt-24 mb-6 flex justify-start">
                  <div className="rounded-full border-8 border-white shadow-2xl shadow-sky-900/20 transition-transform hover:scale-105">
                    {profile?.photo ? (
                      <div className="relative h-40 w-40 overflow-hidden rounded-full">
                        <Image src={profile.photo} alt={name} fill className="object-cover" sizes="160px" />
                      </div>
                    ) : (
                      <div className="grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-5xl font-black text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  {isEditing ? (
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        First Name
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          placeholder="e.g. John"
                          className="mt-1 h-10 w-full rounded-lg border border-sky-100 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none"
                        />
                      </label>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Last Name
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          placeholder="e.g. Doe"
                          className="mt-1 h-10 w-full rounded-lg border border-sky-100 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none"
                        />
                      </label>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        City
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          placeholder="e.g. New York"
                          className="mt-1 h-10 w-full rounded-lg border border-sky-100 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none"
                        />
                      </label>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Country
                        <input
                          type="text"
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          placeholder="e.g. USA"
                          className="mt-1 h-10 w-full rounded-lg border border-sky-100 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none"
                        />
                      </label>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 sm:col-span-2">
                        Bio
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          rows={2}
                          placeholder="Share your travel story..."
                          className="mt-1 w-full resize-none rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-2">
                      <h1 className="text-4xl font-black tracking-tight text-slate-950">{name}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                        <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                          <Icon name="search" className="h-3.5 w-3.5" />
                          {subtitle || "World Traveler"}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Icon name="calendar" className="h-4 w-4" />
                          Joined {new Date().getFullYear()}
                        </span>
                      </div>
                      <p className="max-w-2xl pt-2 text-base leading-relaxed text-slate-500">
                        {profile?.bio || "No bio yet. Share your travel story with the world!"}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleSave}
                          className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-6 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 active:scale-95 disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void loadProfile()}
                          title="Refresh Profile"
                          className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 active:scale-90"
                        >
                          <Icon name="dashboard" className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="inline-flex h-12 items-center gap-3 rounded-2xl bg-[#ff5a3d] px-6 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-orange-200 transition hover:bg-[#f04a2d] hover:shadow-orange-300 active:scale-95"
                        >
                          <Icon name="profile" className="h-5 w-5" />
                          Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
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

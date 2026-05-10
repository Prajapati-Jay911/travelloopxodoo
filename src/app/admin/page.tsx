"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import { apiFetch, apiList } from "@/lib/client-api";

type AdminStats = {
  totalUsers: number;
  totalTrips: number;
  tripsCreatedToday: number;
  topCities: {
    id: string;
    name: string;
    country: string;
    flag: string | null;
    _count: { stops: number };
  }[];
};

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { trips: number };
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdmin = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [statsResult, usersResult] = await Promise.all([
        apiFetch<AdminStats>("/api/admin/stats"),
        apiList<AdminUser>("/api/admin/users?limit=25"),
      ]);
      setStats(statsResult);
      setUsers(usersResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdmin();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdmin]);

  async function deleteUser(id: string) {
    setError("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete user");
    }
  }

  return (
    <AppShell active="Admin">
      <div className="mx-auto max-w-7xl space-y-6 pb-24 lg:pb-0">
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Admin view"
              placeholder="Admin analytics and user management"
              readOnly
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadAdmin()}
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
          >
            Refresh
          </button>
        </section>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Admin Console</h1>
            <p className="mt-1 text-sm text-slate-500">Platform overview and management</p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {isLoading ? (
          <section className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-sky-50" />
            ))}
          </section>
        ) : !stats ? (
          <EmptyState
            title="Admin data unavailable"
            body="You need admin access to view analytics and user controls."
            action={<span className="font-bold text-sky-600">Check your account role</span>}
          />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Total Users",
                  value: stats.totalUsers.toLocaleString(),
                  icon: "community" as const,
                  color: "from-sky-100 text-sky-600",
                },
                {
                  label: "Total Trips",
                  value: stats.totalTrips.toLocaleString(),
                  icon: "trips" as const,
                  color: "from-amber-100 text-amber-600",
                },
                {
                  label: "Trips Today",
                  value: stats.tripsCreatedToday.toLocaleString(),
                  icon: "dashboard" as const,
                  color: "from-emerald-100 text-emerald-600",
                },
                {
                  label: "Top Cities",
                  value: stats.topCities.length.toLocaleString(),
                  icon: "search" as const,
                  color: "from-rose-100 text-rose-600",
                },
              ].map((stat) => (
                <article
                  key={stat.label}
                  className="lift-card rounded-2xl border border-sky-100 bg-gradient-to-br to-white p-5 shadow-xl shadow-sky-900/5"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${stat.color} to-transparent p-3`}
                  >
                    <Icon name={stat.icon} className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-black text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </article>
              ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
                <div className="flex items-center justify-between border-b border-sky-100 p-5">
                  <h2 className="text-lg font-black text-slate-950">Manage Users</h2>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
                    {users.length} users
                  </span>
                </div>
                {users.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">No users found.</p>
                ) : (
                  <div className="divide-y divide-sky-50">
                    {users.map((user) => {
                      const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

                      return (
                        <div
                          key={user.id}
                          className="flex items-center gap-4 p-4 transition hover:bg-sky-50/50"
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-bold text-white shadow-md shadow-sky-200">
                            {initials || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-950">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {user.email} · {user._count.trips} trips
                            </p>
                          </div>
                          <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-600">
                            {user.role}
                          </span>
                          {user.role !== "ADMIN" && (
                            <button
                              type="button"
                              onClick={() => void deleteUser(user.id)}
                              className="rounded-lg border border-rose-100 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
                <div className="border-b border-sky-100 p-5">
                  <h2 className="text-lg font-black text-slate-950">Popular Cities</h2>
                </div>
                <div className="divide-y divide-sky-50 p-2">
                  {stats.topCities.length === 0 ? (
                    <p className="p-3 text-sm text-slate-500">No city usage data available yet.</p>
                  ) : (
                    stats.topCities.map((city, index) => (
                      <div
                        key={city.id}
                        className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-sky-50/50"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-xs font-black text-sky-600">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-950">
                            {city.flag ? `${city.flag} ` : ""}
                            {city.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {city.country} · {city._count.stops.toLocaleString()} stops
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

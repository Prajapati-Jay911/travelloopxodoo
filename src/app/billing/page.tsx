"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import {
  apiList,
  clearAuth,
  formatDateRange,
  formatMoney,
  getAuthToken,
  type TripDto,
} from "@/lib/client-api";

const categoryLabels: Record<"transport" | "stay" | "meals" | "activities" | "misc", string> = {
  transport: "Transport",
  stay: "Stay",
  meals: "Meals",
  activities: "Activities",
  misc: "Misc",
};

export default function BillingPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(Boolean(getAuthToken()));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const trip = trips[0] ?? null;
  const budget = trip?.budget ?? null;
  const spent = trip?.totalCost ?? 0;
  const totalBudget = budget?.totalAllocated ?? 0;
  const remaining = totalBudget - spent;
  const budgetUsedPercent = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;

  const categoryRows = budget
    ? (Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((key) => ({
        key,
        label: categoryLabels[key],
        allocated: budget[key] ?? 0,
      }))
    : [];

  const loadTrips = useCallback(async () => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await apiList<TripDto>("/api/trips?limit=1&sortBy=newest");
      setTrips(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load billing data";
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
      void loadTrips();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTrips]);

  return (
    <AppShell active="Billing">
      <div className="mx-auto max-w-7xl space-y-6 pb-24 lg:pb-0">
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Billing"
              placeholder="Budget allocation and spend summary"
              readOnly
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadTrips()}
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
          >
            Refresh
          </button>
        </section>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {!isLoggedIn ? (
          <EmptyState
            title="Log in to view billing"
            body="Billing uses your real trip budgets and activity costs."
            action={
              <Link href="/login" className="font-bold text-sky-600">
                Go to login
              </Link>
            }
          />
        ) : isLoading ? (
          <section className="space-y-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-2xl bg-sky-50" />
            ))}
          </section>
        ) : !trip ? (
          <EmptyState
            title="No trips found"
            body="Create a trip first to generate real billing and budget insights."
            action={
              <Link href="/trips/new" className="font-bold text-sky-600">
                Plan a trip
              </Link>
            }
          />
        ) : (
          <>
            <Link
              href={`/trips/${trip.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-500"
            >
              ← Back to trip
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
                <div className="grid gap-6 border-b border-sky-100 p-6 md:grid-cols-[1fr_auto]">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">{trip.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      This page now reflects persisted trip budget and spend values only.
                    </p>
                  </div>
                  <Link
                    href={`/trips/${trip.id}/budget`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    View Budget
                  </Link>
                </div>

                {budget ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sky-100 bg-sky-50/50 text-left">
                          <th className="px-4 py-3 font-bold text-slate-600">Category</th>
                          <th className="px-4 py-3 text-right font-bold text-slate-600">Allocated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-50">
                        {categoryRows.map((row) => (
                          <tr key={row.key} className="transition hover:bg-sky-50/30">
                            <td className="px-4 py-3 font-medium text-slate-950">{row.label}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-950">
                              {formatMoney(row.allocated)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="p-6 text-sm text-slate-500">No budget has been created for this trip yet.</p>
                )}
              </section>

              <aside className="space-y-5">
                <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
                  <div className="border-b border-sky-100 p-5">
                    <h3 className="text-lg font-black text-slate-950">Budget Insights</h3>
                  </div>
                  <div className="p-5">
                    <div className="mb-5 flex justify-center">
                      <div className="relative">
                        <svg viewBox="0 0 36 36" className="h-32 w-32">
                          <path
                            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e0f2fe"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#0ea5e9"
                            strokeWidth="3"
                            strokeDasharray={`${budgetUsedPercent}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-slate-950">{budgetUsedPercent}%</span>
                          <span className="text-xs text-slate-500">used</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Budget</span>
                        <span className="font-bold text-slate-950">{formatMoney(totalBudget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Spent</span>
                        <span className="font-bold text-slate-950">{formatMoney(spent)}</span>
                      </div>
                      <div className="flex justify-between border-t border-sky-100 pt-2">
                        <span className="text-slate-500">Remaining</span>
                        <span
                          className={`font-bold ${remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {formatMoney(remaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

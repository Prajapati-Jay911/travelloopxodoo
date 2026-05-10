import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import { formatCurrency, getTrip } from "@/lib/traveloop-data";

export default async function ItineraryBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);
  const stops = trip.stops.length ? trip.stops : getTrip("europe-loop").stops;
  const totalCost = stops.reduce(
    (sum, stop) =>
      sum + stop.activities.reduce((a, act) => a + act.cost, 0),
    0,
  );

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        {/* Trip hero */}
        <section className="relative min-h-[200px] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/8">
          <Image
            src={trip.image}
            alt={trip.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-slate-950/40" />
          <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-200">
                Itinerary
              </p>
              <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
                {trip.name}
              </h1>
              <p className="mt-2 text-sm text-sky-100">{trip.dates}</p>
            </div>
            <div className="hidden rounded-2xl border border-white/20 bg-white/15 p-4 text-center text-white backdrop-blur md:block">
              <p className="text-2xl font-black">{formatCurrency(totalCost)}</p>
              <p className="mt-1 text-xs text-sky-100">Total estimated</p>
            </div>
          </div>
        </section>

        {/* Search toolbar */}
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search activities"
              placeholder="Search activities..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          {["Group by", "Filter", "Sort by"].map((label) => (
            <button
              key={label}
              type="button"
              className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
            >
              {label}
            </button>
          ))}
        </section>

        {/* Day-by-day itinerary */}
        <div className="space-y-6">
          {stops.map((stop, stopIndex) => {
            const dayCost = stop.activities.reduce(
              (sum, act) => sum + act.cost,
              0,
            );

            return (
              <section
                key={stop.id}
                className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
              >
                {/* Day header */}
                <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5">
                  <div className="flex items-center gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-sm font-black text-white shadow-lg shadow-sky-200">
                      D{stopIndex + 1}
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        {stop.city}, {stop.country}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {stop.dates} · {stop.nights} nights
                      </p>
                    </div>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="text-lg font-black text-slate-950">
                      {formatCurrency(dayCost)}
                    </p>
                    <p className="text-xs text-slate-500">estimated cost</p>
                  </div>
                </div>

                {/* Activities timeline */}
                <div className="p-5">
                  <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                    {stop.activities.map((activity, actIndex) => (
                      <div key={activity.id} className="contents">
                        {/* Timeline dot and line */}
                        <div className="relative hidden md:flex md:flex-col md:items-center">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-sky-200 bg-sky-50 text-xs font-bold text-sky-600">
                            {activity.time}
                          </div>
                          {actIndex < stop.activities.length - 1 && (
                            <div className="w-0.5 flex-1 bg-sky-100" />
                          )}
                        </div>

                        {/* Activity card */}
                        <div className="mb-2 rounded-xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100 transition hover:border-sky-200 hover:shadow-md">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-600 md:hidden">
                                  {activity.time}
                                </span>
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                                  {activity.type}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {activity.duration}
                                </span>
                              </div>
                              <h3 className="mt-2 font-bold text-slate-950">
                                {activity.name}
                              </h3>
                              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                {activity.description}
                              </p>
                            </div>
                            <div className="shrink-0 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-center">
                              <p className="text-lg font-black text-slate-950">
                                {formatCurrency(activity.cost)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Summary bar */}
        <section className="surface-panel grid gap-4 rounded-2xl p-5 md:grid-cols-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{stops.length}</p>
            <p className="mt-1 text-sm text-slate-500">Cities</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-950">
              {stops.reduce((s, st) => s + st.activities.length, 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Activities planned</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-950">
              {formatCurrency(totalCost)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Total estimated</p>
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href={`/trips/${trip.id}/checklist`}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <Icon name="check" className="h-4 w-4" />
            Packing List
          </Link>
          <Link
            href={`/trips/${trip.id}/budget`}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
          >
            <Icon name="budget" className="h-4 w-4" />
            View Budget
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

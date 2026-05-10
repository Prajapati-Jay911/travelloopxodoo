import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon, ProgressBar } from "@/components/ui";
import { trips, formatCurrency } from "@/lib/traveloop-data";

const statusColors: Record<string, string> = {
  Ongoing: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Upcoming: "bg-sky-50 text-sky-600 border-sky-200",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
  Draft: "bg-amber-50 text-amber-600 border-amber-200",
};

export default function TripsPage() {
  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        {/* Search toolbar */}
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search trips"
              placeholder="Search trips, cities, dates..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          {["All status", "Newest", "Grid view"].map((label) => (
            <button
              key={label}
              type="button"
              className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
            >
              {label}
            </button>
          ))}
        </section>

        {/* Header */}
        <div className="flex items-center justify-between">
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

        {/* Trip cards */}
        <section className="space-y-5">
          {trips.map((trip) => {
            const progress = Math.round((trip.spent / trip.budget) * 100);

            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="lift-card grid overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5 md:grid-cols-[280px_1fr]"
              >
                <div className="relative min-h-[200px]">
                  <Image
                    src={trip.image}
                    alt={trip.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold backdrop-blur ${statusColors[trip.status]}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-black text-slate-950">
                          {trip.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {trip.dates}
                        </p>
                      </div>
                      <span className="hidden rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600 md:inline-block">
                        {trip.visibility}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {trip.cities.map((city) => (
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
                        Budget: {formatCurrency(trip.spent)} /{" "}
                        {formatCurrency(trip.budget)}
                      </span>
                      <span className="font-bold text-slate-950">
                        {progress}%
                      </span>
                    </div>
                    <ProgressBar value={progress} />

                    <div className="flex gap-5 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Icon name="notes" className="h-3.5 w-3.5" />
                        {trip.notes} notes
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="check" className="h-3.5 w-3.5" />
                        {trip.checklistPacked}/{trip.checklistTotal} packed
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="trips" className="h-3.5 w-3.5" />
                        {trip.cities.length} cities
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}

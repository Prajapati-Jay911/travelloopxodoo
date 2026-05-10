import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import { communityTrips } from "@/lib/traveloop-data";

export default function CommunityPage() {
  return (
    <AppShell active="Community">
      <div className="mx-auto max-w-7xl space-y-6 pb-24 lg:pb-0">
        {/* Search toolbar */}
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search community trips"
              placeholder="Search shared trips, travelers..."
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

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main community feed */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h1 className="shrink-0 text-xl font-black text-slate-950">
                Community Trips
              </h1>
              <span className="text-sm text-slate-500">
                {communityTrips.length} shared itineraries
              </span>
              <span className="h-px flex-1 bg-sky-100" />
            </div>

            {communityTrips.map((trip) => (
              <article
                key={trip.id}
                className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
              >
                <div className="grid md:grid-cols-[220px_1fr]">
                  {/* Trip image */}
                  <div className="relative min-h-[180px]">
                    <Image
                      src={trip.image}
                      alt={trip.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 220px"
                    />
                  </div>

                  {/* Trip details */}
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-black text-white shadow-lg shadow-sky-200">
                        {trip.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {trip.author}
                        </p>
                        <p className="text-xs text-slate-500">Shared a trip</p>
                      </div>
                    </div>

                    <h2 className="mt-4 text-lg font-black text-slate-950">
                      {trip.title}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {trip.cities.map((city) => (
                        <span
                          key={city}
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
                          {trip.days} days
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="community" className="h-4 w-4" />
                          {trip.saves.toLocaleString()} saves
                        </span>
                      </div>
                      <Link
                        href="/trips/new"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 transition hover:text-sky-500"
                      >
                        View trip
                        <Icon name="arrow" className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="surface-panel rounded-2xl p-5">
              <h3 className="text-lg font-black text-slate-950">
                About Community
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Discover itineraries shared by fellow travelers. Get inspired,
                save trips you love, and share your own routes with the
                community.
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
              <h3 className="mb-3 text-sm font-black text-slate-950">
                Popular Cities
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Porto",
                  "Lisbon",
                  "Seoul",
                  "Oslo",
                  "Lagos",
                  "Busan",
                  "Bergen",
                  "Reykjavik",
                ].map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sky-300"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-panel rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-black text-slate-950">
                Top Contributors
              </h3>
              <div className="space-y-3">
                {communityTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-bold text-white">
                      {trip.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {trip.author}
                      </p>
                      <p className="text-xs text-slate-500">
                        {trip.saves.toLocaleString()} saves
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

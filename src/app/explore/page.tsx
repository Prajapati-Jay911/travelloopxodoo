import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import { destinations } from "@/lib/traveloop-data";

export default function ExplorePage() {
  return (
    <AppShell active="Explore">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        {/* Search toolbar */}
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search destinations"
              placeholder="Search destinations, activities..."
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

        {/* Results heading */}
        <div className="flex items-center gap-3">
          <h1 className="shrink-0 text-xl font-black text-slate-950">
            Results
          </h1>
          <span className="text-sm text-slate-500">
            {destinations.length} destinations found
          </span>
          <span className="h-px flex-1 bg-sky-100" />
        </div>

        {/* Destination cards */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              href="/trips/new"
              className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
            >
              <div className="relative h-44">
                <Image
                  src={destination.image}
                  alt={`${destination.city}, ${destination.country}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200 backdrop-blur">
                    {destination.tag}
                  </span>
                  <h3 className="mt-1.5 text-lg font-black text-white">
                    {destination.city}
                  </h3>
                  <p className="text-sm text-sky-100">
                    {destination.flag} {destination.country}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-sky-100 p-4 text-center text-sm">
                <div>
                  <p className="text-slate-500">Region</p>
                  <p className="mt-0.5 font-bold text-slate-950">
                    {destination.region}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Cost</p>
                  <p className="mt-0.5 font-bold text-slate-950">
                    {destination.costIndex}/100
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Popularity</p>
                  <p className="mt-0.5 font-bold text-slate-950">
                    {destination.popularity}%
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import { destinations } from "@/lib/traveloop-data";

export default function NewTripPage() {
  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-sky-900/10">
        <section className="border-b border-sky-100 p-5">
          <h1 className="text-2xl font-black text-slate-950">Plan a new trip</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the details below to start planning your next adventure
          </p>
        </section>

        <form className="space-y-4 border-b border-sky-100 p-5 md:max-w-3xl">
          {/* Trip Name */}
          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>Trip Name:</span>
            <input
              aria-label="Trip Name"
              type="text"
              placeholder="e.g. Europe Design Loop"
              className="h-11 rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100 placeholder:text-slate-400"
            />
          </label>

          {/* Select a Place (dropdown) */}
          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>Select a Place:</span>
            <select
              aria-label="Select a Place"
              className="h-11 rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M6%208.825L.35%203.175l.7-.7L6%207.425l4.95-4.95.7.7z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat pr-10"
            >
              <option value="">Choose a destination...</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.city}, {d.country} — {d.tag}
                </option>
              ))}
            </select>
          </label>

          {/* Start Date */}
          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>Start Date:</span>
            <input
              aria-label="Start Date"
              type="date"
              className="h-11 rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100"
            />
          </label>

          {/* End Date */}
          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>End Date:</span>
            <input
              aria-label="End Date"
              type="date"
              className="h-11 rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100"
            />
          </label>

          {/* Create button */}
          <div className="pt-2 md:pl-[140px] md:pl-[calc(140px+0.75rem)]">
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a3d] px-8 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d] hover:scale-[1.02]"
            >
              <Icon name="plus" className="h-4 w-4" />
              Create Trip
            </button>
          </div>
        </form>

        <section className="border-b border-sky-100 p-5">
          <h2 className="text-xl font-black text-slate-950">
            Suggestion for Places to Visit/Activities to perform
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse popular destinations to add to your itinerary
          </p>
        </section>

        <section className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.slice(0, 6).map((destination) => (
            <Link
              key={destination.id}
              href="/explore"
              className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/8"
            >
              <div className="relative h-48">
                <Image
                  src={destination.image}
                  alt={destination.city}
                  fill
                  className="object-cover"
                  sizes="360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200 backdrop-blur">
                    {destination.tag}
                  </span>
                  <p className="mt-1 font-black text-white">{destination.city}</p>
                  <p className="text-xs text-sky-100">{destination.country}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <div className="flex justify-end p-6 pt-0">
          <Link
            href="/trips/europe-loop/build"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
          >
            Build itinerary <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

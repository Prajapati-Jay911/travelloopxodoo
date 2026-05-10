import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon, ProgressBar } from "@/components/ui";
import { formatCurrency, getTrip } from "@/lib/traveloop-data";

export default async function TripViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);
  const stops = trip.stops.length ? trip.stops : getTrip("europe-loop").stops;
  const budgetProgress = Math.round((trip.spent / trip.budget) * 100);


  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        {/* Hero */}
        <section className="relative min-h-[280px] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/8">
          <Image
            src={trip.image}
            alt={trip.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 flex items-end p-6 md:p-8">
            <div className="flex w-full items-end justify-between">
              <div>
                <span className="inline-block rounded-full border border-white/30 bg-white/85 px-3 py-1 text-xs font-bold text-sky-700 backdrop-blur">
                  {trip.status}
                </span>
                <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
                  {trip.name}
                </h1>
                <p className="mt-2 text-sm text-sky-100">{trip.dates}</p>
              </div>
              <div className="hidden text-right md:block">
                <p className="text-3xl font-black text-white">
                  {formatCurrency(trip.budget)}
                </p>
                <p className="mt-1 text-sm text-sky-100">total budget</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <Icon name="trips" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{stops.length}</p>
                <p className="text-xs text-slate-500">Cities</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Icon name="budget" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{budgetProgress}%</p>
                <p className="text-xs text-slate-500">Budget used</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon name="check" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">
                  {trip.checklistPacked}/{trip.checklistTotal}
                </p>
                <p className="text-xs text-slate-500">Packed</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <Icon name="notes" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{trip.notes}</p>
                <p className="text-xs text-slate-500">Notes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Budget overview */}
        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Budget Overview</h2>
            <span className="text-sm text-slate-500">
              {formatCurrency(trip.spent)} of {formatCurrency(trip.budget)}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={budgetProgress} />
          </div>
        </section>

        {/* City stops */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-950">Route</h2>
          <span className="h-px flex-1 bg-sky-100" />
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stops.map((stop, index) => (
            <article
              key={stop.id}
              className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
            >
              <div className="relative h-40">
                <Image
                  src={stop.image}
                  alt={stop.city}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold text-sky-100 backdrop-blur">
                    Stop {index + 1}
                  </span>
                  <h3 className="mt-1 text-lg font-black text-white">
                    {stop.city}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-500">
                  {stop.flag} {stop.country} · {stop.dates}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {stop.nights} nights · {stop.activities.length} activities
                  </span>
                  <span className="font-bold text-slate-950">
                    Cost: {stop.costIndex}/100
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Quick links */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/trips/${trip.id}/build`}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
          >
            <Icon name="calendar" className="h-4 w-4" />
            Build Itinerary
          </Link>
          <Link
            href={`/trips/${trip.id}/budget`}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <Icon name="budget" className="h-4 w-4" />
            Budget Details
          </Link>
          <Link
            href={`/trips/${trip.id}/checklist`}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <Icon name="check" className="h-4 w-4" />
            Packing List
          </Link>
          <Link
            href={`/trips/${trip.id}/notes`}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <Icon name="notes" className="h-4 w-4" />
            Trip Notes
          </Link>
        </section>
      </div>
    </AppShell>
  );
}

import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { ButtonLink, Icon, ProgressBar } from "@/components/ui";
import { formatCurrency, getTrip } from "@/lib/traveloop-data";

export default async function ItineraryBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);
  const stops = trip.stops.length ? trip.stops : getTrip("europe-loop").stops;

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-7xl space-y-6 pb-24 lg:pb-0">
        <header className="glass-panel rounded-3xl p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                Itinerary builder
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                {trip.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                Saved
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white">
                {formatCurrency(trip.spent)} spent
              </span>
              <ButtonLink href={`/trips/${trip.id}`}>
                Preview <Icon name="arrow" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
          <aside className="surface-panel rounded-3xl p-4">
            <div className="mb-4 flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold text-white">Stops</h2>
              <button
                type="button"
                aria-label="Add stop"
                className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 text-white"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <article
                  key={stop.id}
                  className={`rounded-2xl border bg-slate-950/70 p-4 ${
                    index === 0
                      ? "border-indigo-400 border-l-4"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label={`Reorder ${stop.city}`}
                      className="mt-1 text-slate-500"
                    >
                      <Icon name="more" className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        {stop.flag} / {stop.city}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">{stop.dates}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {stop.activities.length} activities / Cost index {stop.costIndex}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <section className="glass-panel overflow-hidden rounded-3xl">
            <div className="relative h-64">
              <Image
                src={stops[0].image}
                alt={stops[0].city}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 760px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Active stop
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {stops[0].city}, {stops[0].country}
                </h2>
              </div>
            </div>
            <div className="space-y-5 p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {["Start date", "End date", "City budget"].map((field) => (
                  <label key={field} className="text-sm font-medium text-slate-200">
                    {field}
                    <input
                      aria-label={field}
                      className="mt-2 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-100"
                      placeholder={field}
                    />
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Activities</h3>
                <button
                  type="button"
                  aria-label="Add activity"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  Add activity
                </button>
              </div>
              <div className="space-y-3">
                {stops[0].activities.map((activity) => (
                  <div key={activity.id} className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{activity.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {activity.type} / {activity.duration} / {activity.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-amber-300">
                          {formatCurrency(activity.cost)}
                        </span>
                        <button type="button" aria-label={`Edit ${activity.name}`} className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
                <div className="mb-2 flex justify-between text-sm text-slate-400">
                  <span>Stop budget usage</span>
                  <span>72%</span>
                </div>
                <ProgressBar value={72} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

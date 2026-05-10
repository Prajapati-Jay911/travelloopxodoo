import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { BudgetPill, ButtonLink, Icon, ProgressBar } from "@/components/ui";
import { formatCurrency, getTrip } from "@/lib/traveloop-data";

export default async function TripViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-0">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800">
          <div className="relative h-[420px]">
            <Image
              src={trip.image}
              alt={`${trip.name} cover`}
              fill
              preload
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
              {trip.visibility} itinerary
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {trip.name}
            </h1>
            <p className="mt-3 text-slate-200">{trip.dates}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {trip.cities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-white/20 bg-slate-950/55 px-3 py-1 text-sm text-white backdrop-blur"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {["Timeline", "Calendar", "List"].map((mode, index) => (
                <button
                  key={mode}
                  type="button"
                  aria-label={`${mode} view`}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    index === 0
                      ? "border-indigo-400 bg-indigo-500 text-white"
                      : "border-slate-700 bg-slate-950/70 text-slate-300"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {(trip.stops.length ? trip.stops : getTrip("europe-loop").stops).map(
              (stop, index) => (
                <article
                  key={stop.id}
                  className="surface-panel rounded-3xl p-5 md:p-6"
                >
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500 font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold text-white">
                            {stop.city}, {stop.country}
                          </h2>
                          <p className="mt-1 text-sm text-slate-400">
                            {stop.dates} / {stop.nights} nights
                          </p>
                        </div>
                        <Link
                          href={`/trips/${trip.id}/build`}
                          className="text-sm font-semibold text-indigo-300"
                        >
                          Edit stop
                        </Link>
                      </div>
                      <div className="mt-5 space-y-3">
                        {stop.activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-white">
                                  {activity.time} / {activity.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                  {activity.description}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-amber-300">
                                {formatCurrency(activity.cost)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ),
            )}
          </section>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <BudgetPill trip={trip} />
            <div className="surface-panel rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white">Trip readiness</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-400">
                    <span>Packing</span>
                    <span>
                      {trip.checklistPacked}/{trip.checklistTotal}
                    </span>
                  </div>
                  <ProgressBar value={(trip.checklistPacked / trip.checklistTotal) * 100} />
                </div>
                <ButtonLink href={`/trips/${trip.id}/budget`} variant="secondary">
                  Open budget <Icon name="budget" className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href={`/share/${trip.id}`} variant="secondary">
                  Share preview <Icon name="share" className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

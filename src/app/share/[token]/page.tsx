import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Icon } from "@/components/ui";
import { formatCurrency, getTrip } from "@/lib/traveloop-data";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trip = getTrip(token);
  const stops = trip.stops.length ? trip.stops : getTrip("europe-loop").stops;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,#0f172a,#020617)]">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500 font-bold text-white">
              T
            </span>
            <span className="font-semibold text-white">Traveloop</span>
          </Link>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Copy public link" className="hidden h-10 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 sm:block">
              Copy link
            </button>
            <ButtonLink href="/login">
              Copy this trip <Icon name="share" className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800">
          <div className="relative h-[460px]">
            <Image
              src={trip.image}
              alt={`${trip.name} public itinerary`}
              fill
              preload
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
              Public itinerary
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white md:text-6xl">
              {trip.name}
            </h1>
            <p className="mt-3 text-slate-200">
              {trip.dates} / {trip.cities.length} cities / {formatCurrency(trip.spent)} estimated spend
            </p>
          </div>
        </section>

        <section className="grid gap-5">
          {stops.map((stop, index) => (
            <article key={stop.id} className="surface-panel rounded-3xl p-5 md:p-6">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500 font-semibold text-white">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {stop.city}, {stop.country}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">{stop.dates}</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {stop.activities.map((activity) => (
                      <div key={activity.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="font-semibold text-white">{activity.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {activity.time} / {activity.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

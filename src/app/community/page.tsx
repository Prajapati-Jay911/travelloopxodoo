import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { ButtonLink, Icon, PageHeader, SearchToolbar } from "@/components/ui";
import { communityTrips, destinations } from "@/lib/traveloop-data";

export default function CommunityPage() {
  return (
    <AppShell active="Community">
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Shared itineraries"
          title="Learn from polished public trip plans."
          description="Browse public routes, copy useful templates, and spot destination trends before planning."
        />
        <SearchToolbar placeholder="Search shared trips, cities, or authors" />
        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <section className="grid gap-5 md:grid-cols-2">
            {communityTrips.map((trip) => (
              <article
                key={trip.id}
                className="lift-card overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80"
              >
                <div className="relative h-56">
                  <Image
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 460px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                      {trip.avatar}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{trip.author}</p>
                      <p className="text-sm text-slate-400">
                        {trip.days} days / {trip.saves.toLocaleString()} saves
                      </p>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{trip.title}</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trip.cities.map((city) => (
                      <span key={city} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                        {city}
                      </span>
                    ))}
                  </div>
                  <ButtonLink href="/trips/new" variant="secondary">
                    Copy trip <Icon name="share" className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </article>
            ))}
          </section>
          <aside className="space-y-5">
            <div className="surface-panel rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white">Trending destinations</h2>
              <div className="mt-4 space-y-3">
                {destinations.slice(0, 5).map((destination, index) => (
                  <div key={destination.id} className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3">
                    <span className="text-sm text-slate-300">
                      {index + 1}. {destination.city}
                    </span>
                    <span className="text-sm font-semibold text-amber-300">
                      {destination.popularity}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface-panel rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-indigo-300">
                Trip of the week
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Portugal by train
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                A copy-ready plan with hotels, rail buffers, food notes, and daily budget ranges.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

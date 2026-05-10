import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import {
  ButtonLink,
  DestinationCard,
  Icon,
  PageHeader,
  StatCard,
  TripCard,
} from "@/components/ui";
import { destinations, formatCurrency, trips } from "@/lib/traveloop-data";

export default function DashboardPage() {
  const upcoming = trips.filter((trip) => trip.status !== "Completed");

  return (
    <AppShell active="Dashboard">
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-0">
        <section className="glass-panel animate-float-in overflow-hidden rounded-3xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8 lg:p-10">
              <PageHeader
                eyebrow="Good morning, Priya"
                title="Plan the full journey without losing the details."
                description="Traveloop brings stops, activities, budgets, packing, notes, and sharing into one travel operations workspace."
                action={
                  <div className="flex flex-wrap gap-3">
                    <ButtonLink href="/trips/new">
                      <Icon name="plus" className="h-4 w-4" />
                      Plan a trip
                    </ButtonLink>
                    <ButtonLink href="/explore" variant="secondary">
                      <Icon name="search" className="h-4 w-4" />
                      Explore cities
                    </ButtonLink>
                  </div>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard label="Trips planned" value="18" tone="indigo" />
                <StatCard label="Countries visited" value="12" tone="amber" />
                <StatCard
                  label="Budget tracked"
                  value={formatCurrency(24800)}
                  tone="emerald"
                />
              </div>
            </div>
            <div className="relative min-h-[320px]">
              <Image
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
                alt="Mountain road trip landscape"
                fill
                preload
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-amber-200">
                  Next departure
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Europe Design Loop
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  3 cities / 12 days / 61% budget allocated
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Upcoming trips</h2>
            <ButtonLink href="/trips" variant="secondary">
              View all
            </ButtonLink>
          </div>
          <div className="hide-scrollbar flex gap-5 overflow-x-auto pb-3">
            {upcoming.map((trip) => (
              <div key={trip.id} className="w-[330px] shrink-0">
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Featured destinations
              </h2>
              <span className="text-sm text-slate-400">Curated by cost and demand</span>
            </div>
            <div className="hide-scrollbar flex gap-5 overflow-x-auto pb-3">
              {destinations.slice(0, 4).map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          </div>

          <aside className="surface-panel rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white">Previous trips</h2>
            <div className="mt-5 space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div>
                    <p className="font-semibold text-white">{trip.name}</p>
                    <p className="text-sm text-slate-400">{trip.dates}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    {trip.status}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}

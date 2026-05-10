import { AppShell } from "@/components/app-shell";
import { ButtonLink, Icon, PageHeader, SearchToolbar, TripCard } from "@/components/ui";
import { trips } from "@/lib/traveloop-data";

export default function TripsPage() {
  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Trip portfolio"
          title="Manage every journey by status, cost, and readiness."
          description="Search, sort, view, share, and continue building trips with consistent operational controls."
          action={
            <ButtonLink href="/trips/new">
              <Icon name="plus" className="h-4 w-4" />
              New trip
            </ButtonLink>
          }
        />
        <SearchToolbar placeholder="Search by trip, city, or status" />
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
